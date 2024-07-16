/** @import * as self from "./AudioOscillator.js" */
import { GainNode } from "../core/GainNode.js";
import { OscillatorNode } from "../core/OscillatorNode.js";
import { AudioNode } from "../core/node/AudioNode.js";
import { NoteNode } from "../core/node/NoteNode.js";
import { ADSREnvelope } from "../cv/audiorate/ADSREnvelope.js";
import { mixin } from "../utils/mixin.js";

/** @type {self.AudioOscillatorCreator} */
export const AudioOscillator = {
	create,
};

/** @type {self.AudioOscillatorCreator['create']} */
function create(context, config) {
	const oscillator = OscillatorNode.create(context, config?.oscillator);
	const envelope = ADSREnvelope.create(context, config?.envelope);

	const enveloppeGain = GainNode.create(context, {
		gain: 0,
	});

	const output = GainNode.create(context, {
		gain: config?.gain,
	});

	oscillator.connectAudio(enveloppeGain);
	enveloppeGain.connectAudio(output);
	envelope.connectAudio(enveloppeGain.gain);

	const audioSource = AudioNode.source({
		source: output,
	});

	const noteSink = NoteNode.sink({
		noteListener(note) {
			switch (note.type) {
				case "attack": {
					triggerAttack(note);
					break;
				}
				case "release": {
					triggerRelease(note);
					break;
				}
				case "note": {
					setNote(note);
					break;
				}
			}
		},
	});

	return mixin(audioSource, noteSink, {
		get envelope() {
			return envelope;
		},
		get gain() {
			return output.gain;
		},

		setNote,
		triggerAttack,
		triggerRelease,
		dispose,
	});

	function dispose() {
		oscillator.dispose();
		envelope.dispose();
		output.dispose();
		noteSink.dispose();
	}

	/** @type {self.AudioOscillator['setNote']} */
	function setNote(note) {
		if (note.data.portamento) {
			oscillator.frequency.setValueAtTime(
				oscillator.frequency.getValueAtTime(note.time),
				note.time,
			);
			oscillator.frequency.setRampTo(note.data.frequency, {
				endTime: note.data.portamento,
				exponential: true,
			});
		} else {
			oscillator.frequency.setValueAtTime(note.data.frequency, note.time);
		}
	}

	/** @type {self.AudioOscillator['triggerAttack']} */
	function triggerAttack(attack) {
		oscillator.start(attack.time);
		setNote({
			type: "note",
			time: attack.time,
			data: attack.data,
		});
		envelope.triggerAttack(attack);
	}

	/** @type {self.AudioOscillator['triggerRelease']} */
	function triggerRelease(release) {
		const fullRelease = envelope.triggerRelease(release);
		oscillator.stop(release.time, fullRelease.realStop);
		return fullRelease;
	}
}
