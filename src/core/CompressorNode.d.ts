import type { BaseContext } from "./BaseContext.js";
import type { AudioPassThrough } from "./node/AudioNode.js";
import type { DisposableNode } from "./node/DisposableNode.js";
import type { AudioRateParam } from "./param/AudioRateParam.js";

export interface CompressorNode
	extends AudioPassThrough<AudioNode>,
		DisposableNode {
	readonly threshold: AudioRateParam;
	readonly knee: AudioRateParam;
	readonly ratio: AudioRateParam;
	readonly attack: AudioRateParam;
	readonly release: AudioRateParam;
	readonly reduction: number;
}

export type CompressorNodeConfig = {
	threshold?: number;
	knee?: number;
	ratio?: number;
	attack?: number;
	release?: number;
};

interface CompressorNodeCreator {
	create(context: BaseContext, config: CompressorNodeConfig): CompressorNode;
}

export let CompressorNode: CompressorNodeCreator;
