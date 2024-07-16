import type { BaseContext } from "../../core/BaseContext";
import type { AudioNode, AudioSource } from "../../core/node/AudioNode";
import type { DisposableNode } from "../../core/node/DisposableNode";
import type { NoteSink } from "../../core/node/NoteNode";
import type { AudioRateParam } from "../../core/param/AudioRateParam";
import type { LowRateParam } from "../../core/param/LowRateParam";
import type { ADEnvelope } from "../../cv/audiorate/ADEnvelope";
import type { DrumSynth } from "./../Synth";

export interface BassDrum
	extends AudioSource,
		NoteSink,
		DrumSynth,
		DisposableNode {
	readonly clickEnvelope: ADEnvelope;
	readonly bassEnvelope: ADEnvelope;
	readonly clickHPFrequency: AudioRateParam;
	readonly clickLPFrequency:
}

type BassDrumConfig = {
	clickSource: AudioNode;
};

interface BassDrumCreator {
	create(context: BaseContext, config: BassDrumConfig): BassDrum;
}

export let BassDrum: BassDrumCreator;
