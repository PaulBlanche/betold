/** @import * as self from "./BassDrum.js" */

import { BiquadFilter } from "../../core/BiquadFilter.js";
import { Gain } from "../../core/GainNode.js";
import { Oscillator } from "../../core/OscillatorNode.js";
import { AudioNode } from "../../core/node/AudioNode.js";
import { NoteNode } from "../../core/node/NoteNode.js";
import { LowRateParam } from "../../core/param/LowRateParam.js";
import { ADEnvelope } from "../../cv/audiorate/ADEnvelope.js";
import { SoftClipper } from "../../effect/SoftClipper.js";
import { PulseSource } from "../../source/PulseSource.js";
import { mixin } from "../../utils/mixin.js";

/** @type {self.BassDrumCreator} */
export const BassDrum = {
	create,
};
/** @type {self.BassDrumCreator['create']} */
function create(context, config) {
	const decayParam = LowRateParam.create(context, {
		min: 0,
		defaultValue: config.decay ?? 0.1,
	});

	const oscillator = Oscillator.create(context, {
		type: "sine",
		frequency: 48,
	});

	const amplitudeEnvelope = ADEnvelope.create(context, {
		attack: { duration: 0.002, type: "linear" },
		decay: { duration: 0, type: "exponential" },
	});
	const amplitudeEnvelopeGain = Gain.create(context, {
		gain: 0,
	});

	const frequencyEnvelope = ADEnvelope.create(context, {
		attack: { duration: 0.00011, type: "linear" },
		decay: { duration: 0, type: "exponential" },
	});
	const frequencyEnvelopeGain = Gain.create(context, {
		gain: 50,
	});

	const lowpass = BiquadFilter.create(context, {
		type: "lowpass",
		frequency: config.tone ?? 200,
		Q: 1,
	});

	const click = PulseSource.create(context, {
		width: 0.001,
	});

	const preClipperGain = Gain.create(context, {
		gain: 0.6,
	});

	const clipper = SoftClipper.create(context);

	const outputGain = Gain.create(context, {
		gain: config.gain,
	});

	oscillator.connectAudio(amplitudeEnvelopeGain);
	click.connectAudio(amplitudeEnvelopeGain);
	amplitudeEnvelopeGain.connectAudio(lowpass);
	lowpass.connectAudio(preClipperGain);
	preClipperGain.connectAudio(clipper);
	clipper.connectAudio(outputGain);

	amplitudeEnvelope.connectAudio(amplitudeEnvelopeGain.gain);
	frequencyEnvelope.connectAudio(frequencyEnvelopeGain);
	frequencyEnvelopeGain.connectAudio(oscillator.frequency);

	decayParam.connectLowRate(amplitudeEnvelope.decayDuration);
	decayParam.connectLowRate(frequencyEnvelope.decayDuration);

	const audioSource = AudioNode.source({
		source: outputGain,
	});

	const noteSink = NoteNode.sink({
		noteListener(note) {
			if (note.type === "pulse") {
				triggerPulse(note);
			}
		},
	});

	return mixin(audioSource, noteSink, {
		get tone() {
			return lowpass.frequency;
		},
		get decay() {
			return decayParam;
		},

		triggerPulse,
		dispose,
	});

	/** @type {self.BassDrum['triggerPulse']} */
	function triggerPulse(note) {
		const env1Attack = amplitudeEnvelope.triggerPulse(note);
		const env2Attack = frequencyEnvelope.triggerPulse(note);

		const realStop = Math.max(env1Attack.realStop, env2Attack.realStop);

		click.trigger(note.time);
		oscillator.start(note.time);

		oscillator.stop(note.time, realStop);

		return { ...note, realStop };
	}

	function dispose() {
		oscillator.dispose();
		amplitudeEnvelope.dispose();
		amplitudeEnvelopeGain.dispose();
		frequencyEnvelope.dispose();
		frequencyEnvelopeGain.dispose();
		lowpass.dispose();
		click.dispose();
		preClipperGain.dispose();
		clipper.dispose();
		outputGain.dispose();
	}
}
