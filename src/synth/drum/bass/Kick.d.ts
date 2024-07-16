import type { BaseContext } from "../../../core/BaseContext";
import type { AudioSource } from "../../../core/node/AudioNode";
import type { DisposableNode } from "../../../core/node/DisposableNode";
import type { AudioRateParam } from "../../../core/param/AudioRateParam";
import type { LowRateParam } from "../../../core/param/LowRateParam";
import type { DrumSynth } from "../../Synth";

interface Kick extends AudioSource, DrumSynth, DisposableNode {
	decay: LowRateParam;
	impact: AudioRateParam;
	frequency: AudioRateParam;
	sweep: AudioRateParam;
	accent: AudioRateParam;
}

type KickConfig = {
	impact?: number;
	decay?: number;
	frequency?: number;
	sweep?: number;
};

interface KickCreator {
	create(context: BaseContext, config: KickConfig): Kick;
}

export let Kick: KickCreator;
