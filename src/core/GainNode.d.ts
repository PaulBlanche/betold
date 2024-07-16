import type { BaseContext } from "./BaseContext";
import type { AudioPassThrough } from "./node/AudioNode";
import type { DisposableNode } from "./node/DisposableNode";
import type { AudioRateParam } from "./param/AudioRateParam";

export interface GainNode extends AudioPassThrough<AudioNode>, DisposableNode {
	readonly gain: AudioRateParam;
}

export type GainNodeConfig = {
	gain?: number;
};

interface GainNodeCreator {
	create(context: BaseContext, config?: GainNodeConfig): GainNode;
}

export let GainNode: GainNodeCreator;
