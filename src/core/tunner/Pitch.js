/** @import * as self from "./Pitch.js" */

const PITCH_REGEXP =
	/^([A-G]|do|re|mi|fa|sol|la|si|ti)(b{1,2}|#{1,2}|x)?(-[1-4]|[0-9]|10|11)$/;
const SCALE_PITCH_REGEXP =
	/^([A-G]|do|re|mi|fa|sol|la|si|ti)(b{1,2}|#{1,2}|x)?$/;

/** @satisfies {Record<self.SolfegeTone|self.Tone, self.Tone>} */
const SOLFEGE_TO_PITCH = {
	do: "C",
	re: "D",
	mi: "E",
	fa: "F",
	sol: "G",
	la: "A",
	si: "B",
	ti: "B",
	A: "A",
	B: "B",
	C: "C",
	D: "D",
	E: "E",
	F: "F",
	G: "G",
};

/** @type {self.parsePitch} */
export function parsePitch(pitch) {
	const match = pitch.match(PITCH_REGEXP);
	if (match === null) {
		throw Error(`Unknown pitch "${pitch}"`);
	}

	const dirtyTone = /** @type {self.Tone|self.SolfegeTone}*/ (match[1]);
	const tone = /** @type {self.Tone}*/ SOLFEGE_TO_PITCH[dirtyTone];
	const accidental = /** @type {self.Accidental}*/ (match[2]);
	const octave = /** @type {self.Octave}*/ (Number(match[3]));

	return { tone, accidental, octave };
}

/** @type {self.stringifyPitch} */
export function stringifyPitch(pitchObject) {
	return `${pitchObject.tone}${pitchObject.accidental ?? ""}${
		pitchObject.octave
	}`;
}

/** @type {self.parseScalePitch} */
export function parseScalePitch(pitch) {
	const match = pitch.match(SCALE_PITCH_REGEXP);
	if (match === null) {
		throw Error(`Unknown pitch "${pitch}"`);
	}

	const dirtyTone = /** @type {self.Tone|self.SolfegeTone}*/ (match[1]);
	const tone = /** @type {self.Tone}*/ SOLFEGE_TO_PITCH[dirtyTone];
	const accidental = /** @type {self.Accidental}*/ (match[2]);

	return { tone, accidental };
}

/** @type {self.stringifyScalePitch} */
export function stringifyScalePitch(pitchObject) {
	return `${pitchObject.tone}${pitchObject.accidental ?? ""}`;
}
