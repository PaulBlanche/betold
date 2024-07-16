export type Accidental = "bb" | "b" | "#" | "##" | "x";

export type Tone = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type SolfegeTone =
	| "do"
	| "re"
	| "mi"
	| "fa"
	| "sol"
	| "la"
	| "si"
	| "ti";

export type Octave =
	| -4
	| -3
	| -2
	| -1
	| 0
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9
	| 10
	| 11;

export type ScalePitch = `${Tone | SolfegeTone}${Accidental | ""}`;

export type ScalePitchObject = {
	tone: Tone;
	accidental?: Accidental;
};
export type Pitch = `${ScalePitch}${Octave}`;

export type PitchObject = ScalePitchObject & {
	octave: Octave;
};

export function parsePitch(pitch: Pitch): PitchObject;
export function stringifyPitch(pitch: PitchObject): Pitch;

export function parseScalePitch(pitch: ScalePitch): ScalePitchObject;
export function stringifyScalePitch(pitch: ScalePitchObject): ScalePitch;
