/** @import * as self from "./ParamTimeline.js" */
import * as interpolate from "../../utils/interpolate.js";
import { mixin } from "../../utils/mixin.js";
import { Timeline } from "../Timeline.js";

/** @type {self.ParamTimelineCreator} */
export const ParamTimeline = {
	create,
};

/** @type {self.ParamTimelineCreator['create']} */
function create(config) {
	const timeline = /** @type {Timeline<self.ParamEvent>} */ (
		Timeline.create({ transactional: true })
	);

	const paramTimeline = mixin(timeline, {
		getValueAtTime,
		purge,
	});

	return paramTimeline;

	/** @type {self.ParamTimeline['purge']} */
	function purge(time) {
		const event = timeline.get({
			type: "last-before",
			value: time,
			property: "time",
			strict: true,
		});

		let startEvent = event;
		while (startEvent !== undefined && startEvent.type === "setTargetAtTime") {
			startEvent = timeline.getPrevious(startEvent);
		}

		if (startEvent !== undefined) {
			paramTimeline.purgeBefore(startEvent);
		}
	}

	/**
	 * @see https://webaudio.github.io/web-audio-api/#dom-audioparam-cancelandholdattime
	 * @type {self.ParamTimeline['getValueAtTime']}
	 */
	function getValueAtTime(time) {
		const beforeOrAtTime = timeline.get({
			value: time,
			type: "last-before",
		});
		const afterTime = timeline.get({
			value: time,
			type: "first-after",
			strict: true,
		});

		// handle case where event is followed by a ramp
		if (afterTime !== undefined && afterTime.type === "rampToValueAtTime") {
			/** @type {number} */
			let fromTime;
			/** @type {number} */
			let fromValue;

			if (beforeOrAtTime === undefined) {
				// if there was no event before the ramp, ramp from time when the
				// event was scheduled.
				if (time < afterTime.currentTime) {
					return config.defaultValue;
				}
				fromTime = afterTime.currentTime;
				fromValue = config.defaultValue;
			} else if (beforeOrAtTime.type === "setTargetAtTime") {
				if (afterTime.currentTime < beforeOrAtTime.time) {
					// if the event before was a setTargetAtTime that was not
					// started when the ramp was scheduled, replace the
					// setTargetAtTime by the start of the ramp.
					const previous = timeline.getPrevious(beforeOrAtTime);
					fromTime = beforeOrAtTime.time;
					fromValue =
						previous === undefined
							? config.defaultValue
							: getValueAtTime(previous.time);
				} else {
					// if the event before was a setTargetAtTime that was
					// started when the ramp was scheduled, interrupt the
					// setTargetAtTime and run the ramp from there.
					if (time < afterTime.currentTime) {
						return _handleSetTargetAtTime(beforeOrAtTime, time);
					}
					fromTime = afterTime.currentTime;
					fromValue = _handleSetTargetAtTime(
						beforeOrAtTime,
						afterTime.currentTime,
					);
				}
			} else {
				// for any other event before (setValueAtTome or
				// rampToValueAtTime), ramp from time and value of the event
				fromTime = beforeOrAtTime.time;
				fromValue = beforeOrAtTime.value;
			}

			return (
				afterTime.exponential
					? interpolate.exponentialValue
					: interpolate.linearValue
			)(
				{ time: fromTime, value: fromValue },
				{ time: afterTime.time, value: afterTime.value },
				time,
			);
		}

		if (beforeOrAtTime === undefined) {
			return config.defaultValue;
		}

		if (beforeOrAtTime.type === "setTargetAtTime") {
			return _handleSetTargetAtTime(beforeOrAtTime, time);
		}

		return beforeOrAtTime.value;
	}

	/**
	 * @param {import("./ParamTimeline.js").SetTargetAtTimeEvent} event
	 * @param {number} time
	 * @returns {number}
	 */
	function _handleSetTargetAtTime(event, time) {
		const fromTime = event.time;
		const previous = timeline.getPrevious(event);
		let fromValue;
		if (previous === undefined) {
			fromValue = config.defaultValue;
		} else if (previous.type === "setTargetAtTime") {
			fromValue = _handleSetTargetAtTime(previous, event.time);
		} else {
			fromValue = previous.value;
		}

		return interpolate.exponentialTarget(
			{
				time: fromTime,
				value: fromValue,
			},
			{
				target: event.value,
				timeConstant: event.timeConstant,
			},
			time,
		);
	}
}
