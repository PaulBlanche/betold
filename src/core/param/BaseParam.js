/** @import * as self from "./BaseParam.js" */
/** @import {ParamEvent} from "./ParamTimeline.js" */
import * as guard from "../../utils/guard.js";
import * as interpolate from "../../utils/interpolate.js";
import { ParamTimeline } from "./ParamTimeline.js";

/** @type {self.BaseParamCreator} */
export const BaseParam = {
	create,
};

let TRANSACTION_ID = 1;

/** @type {self.BaseParamCreator['create']} */
function create(context, config = {}) {
	const min =
		config.min ??
		(config.audioParam === undefined
			? Number.NEGATIVE_INFINITY
			: config.audioParam.minValue);

	const max =
		config.max ??
		(config.audioParam === undefined
			? Number.POSITIVE_INFINITY
			: config.audioParam.maxValue);

	const defaultValue = Math.max(
		min,
		Math.min(
			max,
			config.defaultValue ??
				(config.audioParam === undefined ? 0 : config.audioParam.defaultValue),
		),
	);

	const timeline = ParamTimeline.create({
		defaultValue: defaultValue,
	});

	const state = {
		/** @type {number|undefined} */
		transaction: undefined,
	};

	if (config.audioParam) {
		config.audioParam.value = defaultValue;
	}
	_baseSetValueAtTime(defaultValue, 0);

	/** @type {self.BaseParam} */
	const self = {
		get min() {
			return min;
		},
		get max() {
			return max;
		},
		get value() {
			return getValueAtTime(context.currentTime);
		},
		set value(value) {
			timeline.purge(context._audioContext.currentTime - 0.1);

			setValueAtTime(value, context.currentTime);
		},
		get defaultValue() {
			return defaultValue;
		},

		setValueAtTime,
		getValueAtTime,
		setRampTo,
		setTargetAtTime,
		setValueCurveAtTime,
		begin,
		end,
		cancelScheduledValuesBetween,
		dispose,
		events() {
			return timeline.iterator();
		},
	};

	context.register(self);

	return self;

	function dispose() {
		timeline.dispose();
		context.deregister(self);
	}

	/** @type {self.BaseParam['begin']} */
	function begin() {
		if (state.transaction === undefined) {
			state.transaction = TRANSACTION_ID++;
			return /** @type {self.Transaction}*/ (state.transaction);
		}

		return /** @type {self.Transaction}*/ (-1);
	}

	/** @type {self.BaseParam['end']} */
	function end(transaction) {
		if (transaction === -1) {
			return;
		}

		state.transaction = undefined;
	}

	/** @type {self.BaseParam['setValueAtTime']} */
	function setValueAtTime(value, dirtyTime) {
		timeline.purge(context._audioContext.currentTime - 10);

		const time = Math.max(context._audioContext.currentTime, dirtyTime);

		// will only cancel transactions overlaping the time, but atomic
		// event are preserved
		cancelScheduledValuesBetween(time + 1 / context.sampleRate, time);

		_baseSetValueAtTime(value, time);
	}

	/** @type {self.BaseParam['getValueAtTime']} */
	function getValueAtTime(time) {
		return timeline.getValueAtTime(time);
	}

	/** @type {self.BaseParam['setRampTo']} */
	function setRampTo(value, rampConfig) {
		timeline.purge(context._audioContext.currentTime - 0.1);

		const time = Math.max(
			context._audioContext.currentTime,
			rampConfig.endTime,
		);

		// will only cancel transactions overlaping the time, but atomic
		// event are preserved
		cancelScheduledValuesBetween(time + 1 / context.sampleRate, time);

		_baseRampToValueAtTime(value, time, rampConfig.exponential);
	}

	/** @type {self.BaseParam['setTargetAtTime']} */
	function setTargetAtTime(value, rampConfig) {
		timeline.purge(context._audioContext.currentTime - 0.1);

		const time = Math.max(
			context._audioContext.currentTime,
			rampConfig.startTime,
		);
		guard.wellOrderedTime(rampConfig.startTime, rampConfig.endTime);

		// cancel events happening during the ramp (and transactions overlaping the ramp)
		cancelScheduledValuesBetween(
			time + 1 / context.sampleRate,
			rampConfig.endTime,
		);

		_rawSetTargetAtTime(value, time, rampConfig.endTime);
	}

	/** @type {self.BaseParam['setValueCurveAtTime']} */
	function setValueCurveAtTime(values, time, duration) {
		timeline.purge(context._audioContext.currentTime - 0.1);

		const transaction = begin();

		const step = duration / (values.length - 1);
		_baseSetValueAtTime(values[0], time);
		for (let i = 1; i < values.length; i++) {
			_baseRampToValueAtTime(values[i], time + i * step);
		}

		end(transaction);
	}

	/** @type {self.BaseParam['cancelScheduledValuesBetween']} */
	function cancelScheduledValuesBetween(dirtyFrom, dirtyTo) {
		timeline.purge(context._audioContext.currentTime - 0.1);

		const from = Math.max(context._audioContext.currentTime, dirtyFrom);
		const to = Math.max(context._audioContext.currentTime, dirtyTo);

		_restoreScheduledValuesFrom(to, _cancelScheduledValuesFrom(from));
	}

	/**
	 * @param {number} time
	 * @returns {ParamEvent[]}
	 */
	function _cancelScheduledValuesFrom(time) {
		const holdValue = getValueAtTime(time);

		const beforeOrAtTime = timeline.get({
			value: time,
			type: "first-after",
		});
		const afterTime = timeline.get({
			value: time,
			type: "first-after",
			strict: true,
		});

		config.audioParam?.cancelScheduledValues(time);

		const canceled = timeline.cancelAfter({
			time,
			currentTime: context._audioContext.currentTime,
			inclusive: true,
		});

		if (afterTime !== undefined && afterTime.type === "rampToValueAtTime") {
			_baseRampToValueAtTime(holdValue, time, afterTime.exponential);
			_baseSetValueAtTime(holdValue, time);
		} else if (beforeOrAtTime !== undefined) {
			if (
				beforeOrAtTime.type === "setTargetAtTime" &&
				beforeOrAtTime.time < time
			) {
				_baseSetTargetAtTime(
					beforeOrAtTime.value,
					beforeOrAtTime.time,
					beforeOrAtTime.timeConstant,
				);
				_baseSetValueAtTime(holdValue, time);
			} else if (
				beforeOrAtTime.type === "setValueAtTime" &&
				beforeOrAtTime.time === time
			) {
				_baseSetValueAtTime(beforeOrAtTime.value, beforeOrAtTime.time);
			}
		}

		return canceled;
	}

	/**
	 *
	 * @param {number} time
	 * @param {ParamEvent[]} events
	 */
	function _restoreScheduledValuesFrom(time, events) {
		timeline.restoreAfter(events, {
			time,
			currentTime: context._audioContext.currentTime,
			onRestore: (event) => {
				switch (event.type) {
					case "rampToValueAtTime": {
						if (event.exponential) {
							config.audioParam?.exponentialRampToValueAtTime(
								event.value,
								event.time,
							);
						} else {
							config.audioParam?.linearRampToValueAtTime(
								event.value,
								event.time,
							);
						}

						break;
					}
					case "setTargetAtTime": {
						config.audioParam?.setTargetAtTime(
							event.value,
							event.time,
							event.timeConstant,
						);
						break;
					}
					case "setValueAtTime": {
						config.audioParam?.setValueAtTime(event.value, event.time);
					}
				}
			},
		});
	}

	/**
	 * @param {number} value
	 * @param {number} startTime
	 * @param {number} endTime
	 */
	function _rawSetTargetAtTime(value, startTime, endTime) {
		const timeConstant = interpolate.getTargetTimeConstant(startTime, endTime);
		const transitionTime = interpolate.getTargetTransitionTime(
			startTime,
			endTime,
		);

		const transaction = begin();

		_baseSetTargetAtTime(value, startTime, timeConstant);
		const holdValue = getValueAtTime(transitionTime);
		_baseSetValueAtTime(holdValue, transitionTime);
		_baseRampToValueAtTime(value, endTime);

		end(transaction);
	}

	/**
	 * @param {number} value
	 * @param {number} time
	 * @returns
	 */
	function _baseSetValueAtTime(value, time) {
		guard.range(value, min, max);

		timeline.add({
			type: "setValueAtTime",
			time,
			value,
			transaction: state.transaction,
		});
		config.audioParam?.setValueAtTime(value, time);
	}

	/**
	 * @param {number} value
	 * @param {number} time
	 * @param {number} timeConstant
	 * @returns
	 */
	function _baseSetTargetAtTime(value, time, timeConstant) {
		guard.range(value, min, max);

		timeline.add({
			type: "setTargetAtTime",
			time,
			value,
			timeConstant,
			transaction: state.transaction,
		});
		config.audioParam?.setTargetAtTime(value, time, timeConstant);
	}

	/**
	 * @param {number} value
	 * @param {number} time
	 * @param {boolean=} exponential
	 */
	function _baseRampToValueAtTime(value, time, exponential) {
		guard.range(value, min, max);

		timeline.add({
			time,
			type: "rampToValueAtTime",
			value,
			exponential,
			currentTime: context._audioContext.currentTime,
			transaction: state.transaction,
		});

		if (exponential) {
			config.audioParam?.exponentialRampToValueAtTime(value, time);
		} else {
			config.audioParam?.linearRampToValueAtTime(value, time);
		}
	}
}
