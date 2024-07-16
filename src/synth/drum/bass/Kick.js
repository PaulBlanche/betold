/** @import * as self from "./Kick.js"; */
import { BiquadFilterNode } from "../../../core/BiquadFilterNode.js";
import { ConstantSourceNode } from "../../../core/ConstantSourceNode.js";
import { GainNode } from "../../../core/GainNode.js";
import { AudioNode } from "../../../core/node/AudioNode.js";
import { LowRateParam } from "../../../core/param/LowRateParam.js";
import { ADEnvelope } from "../../../cv/audiorate/ADEnvelope.js";
import { LowRateMultiply } from "../../../cv/lowrate/LowRateMultiply.js";
import { OscillatorSource } from "../../../source/OscillatorSource.js";
import { mixin } from "../../../utils/mixin.js";
import { Impact } from "./Impact.js";

/** @type {self.KickCreator} */
export const Kick = {
	create,
};

/** @type {self.KickCreator['create']} */
function create(context, config) {
	const impact = Impact.create(context, {
		decay: 0,
		gain: config.impact ?? 0.5,
	});

	const oscillator = OscillatorSource.create(context, {
		type: "sine",
		frequency: config.frequency ?? 48,
	});

	const lowpass = BiquadFilterNode.create(context, {
		type: "lowpass",
		frequency: 200,
		Q: 1,
	});

	const amplitude = GainNode.create(context, {
		gain: 0,
	});

	const output = GainNode.create(context, {
		gain: 1,
	});

	oscillator.connectAudio(lowpass);
	lowpass.connectAudio(amplitude);
	amplitude.connectAudio(output);
	impact.connectAudio(output);

	const envelope = ADEnvelope.create(context, {
		attack: { duration: 0.001 },
		decay: { duration: 0 },
	});

	const envelopeGain = GainNode.create(context, {
		gain: config.sweep ?? 50,
	});

	envelope.connectAudio(envelopeGain);
	envelopeGain.connectAudio(oscillator.frequency);

	envelope.connectAudio(amplitude.gain);

	const decayParam = LowRateParam.create(context, {
		defaultValue: config.decay ?? 0.2,
	});

	const impactDecayParam = LowRateMultiply.create(context, {
		sources: [decayParam, 0.2],
	});

	impactDecayParam.connectLowRate(impact.decay);
	decayParam.connectLowRate(envelope.decayDuration);

	const source = AudioNode.source({
		source: output,
	});

	const accentParam = ConstantSourceNode.create(context, {
		defaultValue: 0,
	});

	return mixin(source, {
		get decay() {
			return decayParam;
		},
		get impact() {
			return impact.gain;
		},
		get frequency() {
			return oscillator.frequency;
		},
		get sweep() {
			return envelopeGain.gain;
		},
		get accent() {
			return accentParam;
		},

		triggerPulse,
		dispose,
	});

	/** @type {self.Kick['triggerPulse']} */
	function triggerPulse(note) {
		const noteWithRealStop = envelope.triggerPulse(note);

		oscillator.start(note.time);
		oscillator.stop(note.time, noteWithRealStop.realStop);

		const impactNotWithRealStop = impact.triggerPulse(note);

		const realStop = Math.max(
			impactNotWithRealStop.realStop,
			noteWithRealStop.realStop,
		);

		return { ...note, realStop };
	}

	function dispose() {
		impact.dispose();
		oscillator.dispose();
		lowpass.dispose();
		amplitude.dispose();
		output.dispose();
		envelope.dispose();
		envelopeGain.dispose();
	}
}
