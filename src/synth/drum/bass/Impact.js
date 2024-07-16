/** @import * as self from "./Impact.js"; */
import { BiquadFilterNode } from "../../../core/BiquadFilterNode.js";
import { GainNode } from "../../../core/GainNode.js";
import { AudioNode } from "../../../core/node/AudioNode.js";
import { ADEnvelope } from "../../../cv/audiorate/ADEnvelope.js";
import { RangeToRange } from "../../../cv/audiorate/RangeToRange.js";
import { NoiseSource } from "../../../source/NoiseSource.js";
import { mixin } from "../../../utils/mixin.js";

/** @type {self.ImpactCreator} */
export const Impact = {
	create,
};

/** @type {self.ImpactCreator['create']} */
function create(context, config) {
	const noise = NoiseSource.create(context);

	const lowpass = BiquadFilterNode.create(context, {
		type: "lowpass",
		frequency: 250,
	});

	const amplitude = GainNode.create(context, {
		gain: 0,
	});

	const output = GainNode.create(context, {
		gain: config.gain,
	});

	noise.connectAudio(lowpass);
	lowpass.connectAudio(amplitude);
	amplitude.connectAudio(output);

	const envelope = ADEnvelope.create(context, {
		attack: { duration: 0.001 },
		decay: { duration: config.decay },
	});

	const envelopeGain = GainNode.create(context, {
		gain: 750,
	});

	envelope.connectAudio(envelopeGain);
	envelopeGain.connectAudio(lowpass.frequency);

	envelope.connectAudio(amplitude.gain);

	const source = AudioNode.source({
		source: output,
	});

	return mixin(source, {
		get decay() {
			return envelope.decayDuration;
		},
		get gain() {
			return output.gain;
		},

		dispose,
		triggerPulse,
	});

	/** @type {self.Impact['triggerPulse']} */
	function triggerPulse(note) {
		const noteWithRealStop = envelope.triggerPulse(note);
		noise.start(note.time);
		noise.stop(note.time, noteWithRealStop.realStop);

		return noteWithRealStop;
	}

	function dispose() {
		noise.dispose();
		lowpass.dispose();
		amplitude.dispose();
		output.dispose();
		envelope.dispose();
		envelopeGain.dispose();
	}
}
