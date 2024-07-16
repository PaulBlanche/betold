import type { BaseContext } from "../../core/BaseContext";
import type { AudioSource } from "../../core/node/AudioNode";
import type { DisposableNode } from "../../core/node/DisposableNode";
import type { NoteSink } from "../../core/node/NoteNode";
import type { AudioRateParam } from "../../core/param/AudioRateParam";
import type { LowRateParam } from "../../core/param/LowRateParam";
import type { DrumSynth } from "./../Synth";
import type { SquareBank } from "./SquareBank";

export interface HiHat
	extends AudioSource,
		NoteSink,
		DrumSynth,
		DisposableNode {
	readonly decay: LowRateParam;
	readonly gain: AudioRateParam;
}

type HiHatConfig = {
	squareBank: SquareBank;
	gain?: number;
	decay?: number;
};

interface HiHatCreator {
	create(context: BaseContext, config: HiHatConfig): HiHat;
}

export let HiHat: HiHatCreator;
