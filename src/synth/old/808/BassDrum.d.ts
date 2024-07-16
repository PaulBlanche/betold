import type { BaseContext } from "../../core/BaseContext";
import type { AudioSource } from "../../core/node/AudioNode";
import type { DisposableNode } from "../../core/node/DisposableNode";
import type { NoteSink } from "../../core/node/NoteNode";
import type { AudioRateParam } from "../../core/param/AudioRateParam";
import type { LowRateParam } from "../../core/param/LowRateParam";
import type { DrumSynth } from "./../Synth";

export interface BassDrum
	extends AudioSource,
		NoteSink,
		DrumSynth,
		DisposableNode {
	readonly tone: AudioRateParam;
	readonly decay: LowRateParam;
}

type BassDrumConfig = {
	gain?: number;
	tone?: number;
	decay?: number;
};

interface BassDrumCreator {
	create(context: BaseContext, config: BassDrumConfig): BassDrum;
}

export let BassDrum: BassDrumCreator;
