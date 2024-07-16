/** @import * as self from "./HiHat.js" */
import { BiquadFilter } from "../../core/BiquadFilter.js";
import { Gain } from "../../core/GainNode.js";
import { AudioNode } from "../../core/node/AudioNode.js";
import { NoteNode } from "../../core/node/NoteNode.js";
import { ADEnvelope } from "../../cv/audiorate/ADEnvelope.js";
import { mixin } from "../../utils/mixin.js";

export const HiHat = {
	create,
};

/** @type {self.HiHatCreator['create']} */
function create(context, config) {
	const midFilter = BiquadFilter.create(context, {
		type: "bandpass",
		frequency: 10_000,
	});

	const highFilter = BiquadFilter.create(context, {
		type: "highpass",
		frequency: 8_000,
	});

	const envelope = ADEnvelope.create(context, {
		attack: { type: "linear", duration: 0.001 },
		decay: {
			type: "linear",
			duration: config.decay ?? 0.05,
		},
	});
	const envelopeGain = Gain.create(context, {
		gain: 0,
	});

	const outputGain = Gain.create(context, {
		gain: config.gain,
	});

	for (const oscillator of config.squareBank.oscillators) {
		oscillator.connectAudio(midFilter);
	}
	midFilter.connectAudio(envelopeGain);
	envelopeGain.connectAudio(highFilter);
	highFilter.connectAudio(outputGain);

	envelope.connectAudio(envelopeGain.gain);

	const audioSource = AudioNode.source({
		source: outputGain,
	});

	const noteSink = NoteNode.sink({
		noteListener(note) {
			if (note.type === "attack") {
				triggerAttack(note);
			}
		},
	});

	return mixin(audioSource, noteSink, {
		get decay() {
			return envelope.decayDuration;
		},
		get gain() {
			return outputGain.gain;
		},

		triggerAttack,
		dispose,
	});

	/** @type {self.HiHat['triggerAttack']} */
	function triggerAttack(note) {
		return envelope.triggerAttack(note);
	}

	function dispose() {
		midFilter.dispose();
		highFilter.dispose();
		envelope.dispose();
		envelopeGain.dispose();
	}
}
