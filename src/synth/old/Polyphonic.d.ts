import type { Attack, Release } from "../Note";
import type { BaseContext } from "../core/BaseContext";
import type { AudioSource } from "../core/node/AudioNode";
import type { NoteSink } from "../core/node/NoteNode";
import type { MonoSynth, PolySynth } from "./Synth";

type Voice = {
	source: VoiceSource;
	lastNote?: Attack | (Release & { realStop: number });
};

interface VoiceSource extends AudioSource, NoteSink, MonoSynth {}

type PolyphonicConfig = {
	voice: () => VoiceSource;
	polyphony?: number;
	priority?: "first-note" | "last-note";
};

interface Polyphonic extends AudioSource, NoteSink, PolySynth {}

interface PolyphonicCreator {
	create(context: BaseContext, config: PolyphonicConfig): Polyphonic;
}

export let Polyphonic: PolyphonicCreator;
