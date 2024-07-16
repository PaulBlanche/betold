/** @import * as self from "./BeatFrequencyParam.js" */
import * as guard from "../../utils/guard.js";
import * as interpolate from "../../utils/interpolate.js";
import { mixin, omit } from "../../utils/mixin.js";
import { Timeline } from "../Timeline.js";
import { AudioNode } from "../node/AudioNode.js";

/** @type {self.BeatFrequencyParamCreator} */
export const BeatFrequencyParam = {
	create,
};

/** @type {self.BeatFrequencyParamCreator['create']} */
function create(context, config) {
	const min = 0;
	const max =
		"sink" in config.audioParam
			? config.audioParam.max
			: config.audioParam.maxValue;

	const defaultBeatFrequency = config.defaultBeatFrequency ?? 2;

	const audioParam =
		"sink" in config.audioParam ? config.audioParam.sink : config.audioParam;

	const timeline = /** @type {Timeline<self.BeatFrequencyEvent>} */ (
		Timeline.create({
			increasing: true,
			transactional: false,
		})
	);

	const sink = AudioNode.sink({
		sink: audioParam,
	});

	timeline.add({
		type: "setFrequencyAtTime",
		frequency: defaultBeatFrequency,
		time: 0,
		beat: 0,
	});
	audioParam.setValueAtTime(defaultBeatFrequency, 0);

	return mixin(omit(sink, ["dispose"]), {
		setValueAtTime,
		setRampTo,
		getBeatAtTime,
		getValueAtTime,
		getTimeAtBeat,
		dispose,
	});

	function dispose() {
		timeline.dispose();
	}

	/** @type {self.BeatFrequencyParam['setValueAtTime']} */
	function setValueAtTime(frequency, dirtyTime) {
		const time = Math.max(context.currentTime, dirtyTime);
		guard.range(frequency, min, max);

		/** @type {self.SetFrequencyAtTimeEvent} */
		const eventToAdd = {
			type: "setFrequencyAtTime",
			time,
			frequency,
			beat: 0,
		};

		eventToAdd.beat = getBeatAtTime(time);
		timeline.add(eventToAdd);
		audioParam.setValueAtTime(frequency, time);
	}

	/** @type {self.BeatFrequencyParam['setRampTo']} */
	function setRampTo(frequency, rampConfig) {
		const time = Math.max(context.currentTime, rampConfig.endTime);
		guard.range(frequency, min, max);

		/** @type {self.RampToFrequencyAtTime} */
		const eventToAdd = {
			type: "rampToFrequencyAtTime",
			time,
			frequency,
			beat: 0,
			currentTime: context.currentTime,
		};

		const rampStartTime = timeline.last()?.time ?? 0;
		const rampStartBeat = getBeatAtTime(rampStartTime);

		eventToAdd.beat =
			rampStartBeat +
			_rampRelativeBeat(
				{ time: rampStartTime, frequency: getValueAtTime(rampStartTime) },
				{ time, frequency },
				time,
			);

		timeline.add(eventToAdd);
		audioParam.setValueAtTime(frequency, time);
	}

	/** @type {self.BeatFrequencyParam['getBeatAtTime']}*/
	function getBeatAtTime(time) {
		const beforeOrAtTime = timeline.get({ value: time, type: "last-before" });

		const afterTime = timeline.get({
			value: time,
			type: "first-after",
			strict: true,
		});

		if (beforeOrAtTime === undefined && afterTime === undefined) {
			return defaultBeatFrequency * time;
		}

		const startTime = beforeOrAtTime?.time ?? 0;
		const startBeat = beforeOrAtTime?.beat ?? 0;

		if (afterTime && afterTime.type === "rampToFrequencyAtTime") {
			return (
				_rampRelativeBeat(
					{ time: startTime, frequency: getValueAtTime(startTime) },
					{ time: afterTime.time, frequency: afterTime.frequency },
					time,
				) + startBeat
			);
		}

		return (
			_constantRelativeBeat(startTime, getValueAtTime(time), time) + startBeat
		);
	}

	/**
	 * @param {{ frequency:number, time:number}} from
	 * @param {{ frequency:number, time:number}} to
	 * @param {number} time
	 * @returns
	 */
	function _rampRelativeBeat(from, to, time) {
		const relativeTime = time - from.time;
		const R = (to.frequency - from.frequency) / (to.time - from.time);
		return from.frequency * relativeTime + R * (0.5 * relativeTime ** 2);
	}

	/**
	 * @param {number} fromTime
	 * @param {number} frequencyAtTime
	 * @param {number} time
	 * @returns
	 */
	function _constantRelativeBeat(fromTime, frequencyAtTime, time) {
		return (time - fromTime) * frequencyAtTime;
	}

	/** @type {self.BeatFrequencyParam['getTimeAtBeat']}*/
	function getTimeAtBeat(beat) {
		const beforeOrAtBeat = timeline.get({
			value: beat,
			property: "beat",
			type: "last-before",
		});
		const afterBeat = timeline.get({
			value: beat,
			property: "beat",
			type: "first-after",
			strict: true,
		});

		if (beforeOrAtBeat === undefined && afterBeat === undefined) {
			return beat / defaultBeatFrequency;
		}

		const startTime = beforeOrAtBeat?.time ?? 0;
		const startBeat = beforeOrAtBeat?.beat ?? 0;

		if (afterBeat && afterBeat.type === "rampToFrequencyAtTime") {
			return (
				_rampRelativeTime(
					{
						time: startTime,
						beat: startBeat,
						frequency: getValueAtTime(startTime),
					},
					{ time: afterBeat.time, frequency: afterBeat.frequency },
					beat,
				) + startTime
			);
		}

		return (
			_constantRelativeTime(startBeat, getValueAtTime(startTime), beat) +
			startTime
		);
	}

	/**
	 * @param {{ frequency:number, time:number, beat:number}} from
	 * @param {{ frequency:number, time:number}} to
	 * @param {number} beat
	 */
	function _rampRelativeTime(from, to, beat) {
		const relativeBeat = beat - from.beat;
		const R = (to.time - from.time) / (to.frequency - from.frequency);
		return (
			Math.sqrt(2 * relativeBeat * R + (from.frequency * R) ** 2) -
			from.frequency * R
		);
	}

	/**
	 * @param {number} fromBeat
	 * @param {number} frequencyAtBeat
	 * @param {number} beat
	 */
	function _constantRelativeTime(fromBeat, frequencyAtBeat, beat) {
		return (beat - fromBeat) / frequencyAtBeat;
	}

	/**
	 * @type {self.BeatFrequencyParam['getValueAtTime']}
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
		if (afterTime !== undefined && afterTime.type === "rampToFrequencyAtTime") {
			/** @type {number} */
			let fromTime;
			/** @type {number} */
			let fromValue;

			if (beforeOrAtTime === undefined) {
				// if there was no event before the ramp, ramp from time when the
				// event was scheduled.
				if (time < afterTime.currentTime) {
					return defaultBeatFrequency;
				}
				fromTime = afterTime.currentTime;
				fromValue = defaultBeatFrequency;
			} else {
				// ramp from time and value of the event
				fromTime = beforeOrAtTime.time;
				fromValue = beforeOrAtTime.frequency;
			}

			return interpolate.linearValue(
				{ time: fromTime, value: fromValue },
				{ time: afterTime.time, value: afterTime.frequency },
				time,
			);
		}

		if (beforeOrAtTime === undefined) {
			return defaultBeatFrequency;
		}

		return beforeOrAtTime.frequency;
	}
}
