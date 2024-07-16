import type { BaseContext } from "../../../core/BaseContext";
import type { AudioSource } from "../../../core/node/AudioNode";
import type { DisposableNode } from "../../../core/node/DisposableNode";
import type { AudioRateParam } from "../../../core/param/AudioRateParam";
import type { LowRateParam } from "../../../core/param/LowRateParam";
import type { DrumSynth } from "../../Synth";

interface Impact extends AudioSource, DrumSynth, DisposableNode {
	readonly gain: AudioRateParam;
	readonly decay: LowRateParam;
}

type ImpactConfig = {
	gain: number;
	decay: number;
};

interface ImpactCreator {
	create(context: BaseContext, config: ImpactConfig): Impact;
}

export let Impact: ImpactCreator;
