/** @import * as self from "./TetTunner.js" */
/** @import { Accidental, Tone, PitchObject } from "./Pitch.js" */
/** @import { Tunner } from "./Tunner.js" */

import { parsePitch } from "./Pitch.js";

/** @satisfies {Record<Accidental, number>} */
const ACCIDENTAL_MAP = {
	bb: -2,
	b: -1,
	"#": 1,
	"##": 2,
	x: 2,
};

/**
 * @param {number} l
 * @param {number} h
 * @returns {Record<Tone, number>}
 */
function makeTetToneMap(l, h) {
	return {
		C: 0,
		D: l,
		E: 2 * l,
		F: 2 * l + h,
		G: 3 * l + h,
		A: 4 * l + h,
		B: 5 * l + h,
	};
}

const TET_TONE_MAP = {
	12: makeTetToneMap(2, 1), // 5*2+2*1 = 12
	19: makeTetToneMap(3, 2), // 5*3+2*2 = 19
	24: makeTetToneMap(4, 2), // 5*4+2*2 = 24
	31: makeTetToneMap(5, 3), // 5*5+2*3 = 31
};

/** @type {self.TetTunnerCreator} */
export const TetTunner = {
	create,
};

/** @type {self.TetTunnerCreator['create']} */
function create(config) {
	const referenctTetIndex = _tetIndexOfPitch(
		parsePitch(config.reference.pitch),
	);

	return {
		frequencyOfPitch,
	};

	/** @type {Tunner['frequencyOfPitch']} */
	function frequencyOfPitch(pitch) {
		const absoluteIndex = _tetIndexOfPitch(parsePitch(pitch));
		const relativeIndex = absoluteIndex - referenctTetIndex;

		return config.reference.frequency * 2 ** (relativeIndex / config.tet);
	}

	/**
	 * @param {PitchObject} pitchObject
	 * @return {number}
	 */
	function _tetIndexOfPitch(pitchObject) {
		return (
			pitchObject.octave * config.tet +
			TET_TONE_MAP[config.tet][pitchObject.tone] +
			(pitchObject.accidental === undefined
				? 0
				: ACCIDENTAL_MAP[pitchObject.accidental])
		);
	}
}
