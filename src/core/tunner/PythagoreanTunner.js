/** @import * as self from "./PythagoreanTunner.js" */
/** @import { Accidental, Tone, ScalePitch } from "./Pitch.js" */
/** @import { Tunner } from "./Tunner.js" */
import { parsePitch, stringifyScalePitch } from "./Pitch.js";

const APOTOME = 3 ** 7 / 2 ** 11;

const LEIMMA = 2 ** 8 / 3 ** 5;

/** @satisfies {Record<Accidental, number>} */
const ACCIDENTAL_MAP = {
	bb: -2,
	b: -1,
	"#": 1,
	"##": 2,
	x: 2,
};

/** @satisfies {Record<Tone, number>} */
const TONE_MAP = {
	C: 0,
	D: 2,
	E: 4,
	F: 5,
	G: 7,
	A: 9,
	B: 11,
};

const SCALE_MAP = _scaleMap();

/** @type {self.PythagoreanTunnerCreator} */
export const PythagoreanTunner = {
	create,
};

/** @type {self.PythagoreanTunnerCreator['create']} */
function create(config) {
	const referenceCoeff =
		config.reference.frequency /
		_relativeFrequencyOfPitch(config.reference.pitch);

	return {
		frequencyOfPitch,
	};

	/** @type {Tunner['frequencyOfPitch']} */
	function frequencyOfPitch(pitch) {
		return referenceCoeff * _relativeFrequencyOfPitch(pitch);
	}

	/** @type {Tunner['frequencyOfPitch']} */
	function _relativeFrequencyOfPitch(pitch) {
		const pitchObject = parsePitch(pitch);
		const scalePitch = stringifyScalePitch(pitchObject);
		return SCALE_MAP[scalePitch] * 2 ** pitchObject.octave;
	}
}

/**
 * @returns {Record<ScalePitch, number>}
 */
function _scaleMap() {
	const scaleMap = /** @type {Record<ScalePitch, number>} */ ({});

	let previousTone = undefined;
	for (const _tone in TONE_MAP) {
		const tone = /** @type {Tone} */ (_tone);

		if (previousTone === undefined) {
			scaleMap[tone] = 1;
		} else {
			const delta = TONE_MAP[tone] - TONE_MAP[previousTone];
			if (delta === 2) {
				scaleMap[tone] = scaleMap[previousTone] * APOTOME * LEIMMA;
			} else if (delta === 1) {
				scaleMap[tone] = scaleMap[previousTone] * LEIMMA;
			}
		}

		for (const _accidental in ACCIDENTAL_MAP) {
			const accidental = /** @type {Accidental} */ (_accidental);
			scaleMap[`${tone}${accidental}`] =
				scaleMap[tone] * APOTOME ** ACCIDENTAL_MAP[accidental];
		}
		previousTone = tone;
	}

	return scaleMap;
}
