import type { Attack, Pulse, Release, SetNote } from "../Note";

export interface Gated {
	triggerAttack(attack: Attack): void;
	triggerRelease(release: Release): Release & { realStop: number };
}

export interface Triggered {
	triggerPulse(pulse: Pulse): Pulse & { realStop: number };
}

export interface MonoSynth extends Gated {
	setNote(note: SetNote): void;
}

export interface PolySynth extends Gated {}

export interface DrumSynth extends Triggered {}
