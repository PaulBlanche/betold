import type { BaseContext } from "../BaseContext.js";
import type { AudioPassThrough } from "../node/AudioNode.js";
import type { DisposableNode } from "../node/DisposableNode.js";
import type { BeatFrequencyParam } from "./BeatFrequencyParam.js";

export interface BeatFrequency
	extends BeatFrequencyParam,
		AudioPassThrough<AudioParam>,
		DisposableNode {}

type BeatFrequencyConfig = {
	defaultBeatFrequency?: number;
};

interface BeatFrequencyCreator {
	create(context: BaseContext, config: BeatFrequencyConfig): BeatFrequencyParam;
}

export let BeatFrequency: BeatFrequencyCreator;
