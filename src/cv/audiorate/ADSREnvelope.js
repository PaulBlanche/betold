/** @import * as self from "./ADSREnvelope.js" */
import { ConstantSourceNode } from "../../core/ConstantSourceNode.js";
import { AudioNode } from "../../core/node/AudioNode.js";
import { LowRateParam } from "../../core/param/LowRateParam.js";
import { mixin } from "../../utils/mixin.js";

/** @type {self.ADSREnvelopeCreator} */
export const ADSREnvelope = {
	create,
};

/** @type {self.ADSREnvelopeCreator['create']} */
function create(context, config = {}) {
	/** @type {self.ADSREnvelopeState} */
	const state = {
		attackType: config.attack?.type ?? "linear",
		decayType: config.decay?.type ?? "exponential",
		releaseType: config.release?.type ?? "exponential",
	};

	const attackDurationParam = LowRateParam.create(context, {
		min: 0,
		defaultValue: config.attack?.duration ?? 0.01,
	});

	const decayDurationParam = LowRateParam.create(context, {
		min: 0,
		defaultValue: config.decay?.duration ?? 0.1,
	});

	const sustainParam = LowRateParam.create(context, {
		min: 0,
		defaultValue: config.sustain ?? 0.5,
	});

	const releaseDurationParam = LowRateParam.create(context, {
		min: 0,
		defaultValue: config.release?.duration ?? 1,
	});

	const cv = ConstantSourceNode.create(context, {
		min: 0,
		max: 1,
		defaultValue: 0,
	});

	const node = AudioNode.source({
		source: cv,
	});

	return mixin(node, {
		get attackDuration() {
			return attackDurationParam;
		},
		get attackType() {
			return state.attackType;
		},
		set attackType(type) {
			state.attackType = type;
		},
		get decayDuration() {
			return decayDurationParam;
		},
		get decayType() {
			return state.decayType;
		},
		set decayType(type) {
			state.decayType = type;
		},
		get sustain() {
			return sustainParam;
		},
		get releaseDuration() {
			return releaseDurationParam;
		},
		get releaseType() {
			return state.releaseType;
		},
		set releaseType(type) {
			state.releaseType = type;
		},
		get value() {
			return cv.value;
		},

		getValueAtTime,
		triggerAttack,
		triggerRelease,
		dispose,
	});

	function dispose() {
		cv.dispose();
	}

	/** @type {self.ADSREnvelope['getValueAtTime']} */
	function getValueAtTime(time = context.currentTime) {
		return cv.getValueAtTime(time);
	}

	/** @type {self.ADSREnvelope['triggerAttack']} */
	function triggerAttack(note) {
		const currentValue = cv.getValueAtTime(note.time);

		const attackDurationAtTime = attackDurationParam.read(note.time);
		// attackDuration proportional to remeaning distance to 1 (max cv value)
		const attackDuration = (1 - currentValue) * attackDurationAtTime;

		const decayDuration = decayDurationParam.read(note.time + attackDuration);

		// cancel everything betwen attack start and attack end
		cv.cancelScheduledValuesBetween(
			note.time,
			note.time + attackDuration + decayDuration,
		);

		const transaction = cv.begin();

		if (attackDuration < 1 / context.sampleRate) {
			cv.setValueAtTime(1, note.time);
		} else if (
			state.attackType === "linear" ||
			state.attackType === "exponential"
		) {
			cv.setValueAtTime(currentValue, note.time);
			cv.setRampTo(1, {
				exponential: state.attackType === "exponential",
				endTime: note.time + attackDuration,
			});
		} else {
			// find starting point on the curve
			let curve = state.attackType;
			for (let i = 1; i < curve.length; i++) {
				if (curve[i - 1] <= currentValue && currentValue <= curve[i]) {
					curve = state.attackType.slice(i);
					curve[0] = currentValue;
					break;
				}
			}

			cv.setValueCurveAtTime(curve, note.time, attackDuration);
		}

		const sustain = sustainParam.read(
			note.time + attackDuration + decayDuration,
		);

		if (decayDuration > 1 / context.sampleRate && sustain < 1) {
			if (state.decayType === "linear") {
				cv.setRampTo(sustain, {
					endTime: note.time + attackDuration + decayDuration,
				});
			} else {
				cv.setTargetAtTime(sustain, {
					startTime: note.time + attackDuration,
					endTime: note.time + attackDuration + decayDuration,
				});
			}
		}

		cv.end(transaction);
	}

	/** @type {self.ADSREnvelope['triggerRelease']} */
	function triggerRelease(note) {
		const currentValue = cv.getValueAtTime(note.time);

		if (currentValue === 0) {
			return { ...note, realStop: note.time };
		}

		const releaseDuration = releaseDurationParam.read(note.time);

		// cancel everything betwen release start and release end
		cv.cancelScheduledValuesBetween(note.time, note.time + releaseDuration);

		const transaction = cv.begin();

		if (releaseDuration < 1 / context.sampleRate) {
			cv.setValueAtTime(0, note.time);
		} else if (
			state.releaseType === "linear" ||
			state.releaseType === "exponential"
		) {
			cv.setValueAtTime(currentValue, note.time);
			if (state.releaseType === "linear") {
				cv.setRampTo(0, {
					endTime: note.time + releaseDuration,
				});
			} else {
				cv.setTargetAtTime(0, {
					startTime: note.time,
					endTime: note.time + releaseDuration,
				});
			}
		} else {
			cv.setValueCurveAtTime(state.releaseType, note.time, releaseDuration);
		}

		cv.end(transaction);

		return { ...note, realStop: note.time + releaseDuration };
	}
}
