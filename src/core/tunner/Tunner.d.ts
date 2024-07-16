import type { Pitch, Tone } from "./Pitch";

export interface Tunner {
	frequencyOfPitch(pitch: Pitch): number;
}

export type TunnerConfig = {
	system?:
		| { type: "tet"; tet?: 12 | 19 | 24 | 31 }
		| { type: "pythagorean"; base: Tone };
	reference?: { pitch: Pitch; frequency: number };
};

interface TunnerCreator {
	create(config: TunnerConfig): Tunner;
}

export let Tunner: TunnerCreator;
