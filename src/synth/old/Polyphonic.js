/** @import * as self from "./Polyphonic.js" */
/** @import * as note from "../Note.js" */
import { Gain } from "../core/GainNode.js";
import { AudioNode } from "../core/node/AudioNode.js";
import { NoteNode } from "../core/node/NoteNode.js";
import { mixin } from "../utils/mixin.js";

/** @type {self.PolyphonicCreator} */
export const Polyphonic = {
	create,
};

/** @type {self.PolyphonicCreator['create']} */
function create(context, config) {
	const polyphony = config.polyphony ?? Number.POSITIVE_INFINITY;
	const priority = config.priority ?? "last-note";

	const state = {
		/** @type {self.Voice[]} */
		voices: [],
		roundRobinIndex: 0,
	};

	const output = Gain.create(context, {
		gain: 0,
	});

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
			}
		},
	});

	return mixin(audioSource, noteSink, {
		triggerAttack,
		triggerRelease,
	});

	/** @type {self.Polyphonic['triggerAttack']} */
	function triggerAttack(note) {
		const voice = _getVoiceFor(note);
		if (voice === undefined) {
			return;
		}

		voice.source.triggerAttack(note);
		voice.lastNote = note;
	}

	/** @type {self.Polyphonic['triggerRelease']} */
	function triggerRelease(note) {
		const voice = _getVoiceFor(note);
		if (voice === undefined) {
			return;
		}

		const release = voice.source.triggerRelease(note);
		voice.lastNote = release;
	}

	/**
	 * @param {note.Attack|note.Release} note
	 * @returns {self.Voice|undefined}
	 */
	function _getVoiceFor(note) {
		// check if a voice from pool is available
		for (const voice of state.voices) {
			if (_canVoiceHandleNote(voice, note)) {
				return voice;
			}
		}

		// create more voice if we did not reach max polyphony
		if (state.voices.length < polyphony) {
			const newVoice = { source: config.voice() };
			state.voices.push(newVoice);
			return newVoice;
		}

		// if all voices are used, steal one if possible
		return _stealVoice(note);
	}

	/**
	 * @param {note.Attack|note.Release} note
	 * @returns {self.Voice|undefined}
	 */
	function _stealVoice(note) {
		if (priority === "first-note") {
			return;
		}

		let stolenVoice = state.voices[0];

		for (const voice of state.voices) {
			// should have been handled in first for loop, but typescript can't
			// infer that it should be defined :(
			if (voice.lastNote === undefined) {
				return voice;
			}

			// should have been handled in first for loop, but typescript can't
			// infer that it should be defined :(
			if (stolenVoice.lastNote === undefined) {
				return stolenVoice;
			}

			if (voice.lastNote.time < stolenVoice.lastNote.time) {
				stolenVoice = voice;
			}
		}

		return stolenVoice;
	}

	/**
	 *
	 * @param {self.Voice} voice
	 * @param {note.Attack|note.Release} note
	 */
	function _canVoiceHandleNote(voice, note) {
		if (voice.lastNote === undefined) {
			return true;
		}

		if (note.type === "attack") {
			if (voice.lastNote.type === "attack") {
				return false;
			}
			return voice.lastNote.realStop < note.time;
		}

		return true;
	}
}
