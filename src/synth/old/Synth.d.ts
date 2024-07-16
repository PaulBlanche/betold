import type { Attack, Pulse, Release, SetNote } from "../Note";

export interface MonoSynth {
	triggerAttack(attack: Attack): void;
	triggerRelease(release: Release): Release & { realStop: number };
	setNote(note: SetNote): void;
}

export interface PolySynth {
	triggerAttack(attack: Attack): void;
	triggerRelease(release: Release): void;
}

export interface DrumSynth {
	triggerPulse(pulse: Pulse): Pulse & { realStop: number };
}
