import type { BaseContext } from "./BaseContext";
import type { AudioPassThrough } from "./node/AudioNode";
import type { DisposableNode } from "./node/DisposableNode";

export interface WaveShaperNode
	extends AudioPassThrough<AudioNode>,
		DisposableNode {
	readonly curve: Float32Array;
	readonly oversample: OverSampleType;
}

type WaveShapperCurve =
	| { mapping: (value: number, index?: number) => number; length?: number }
	| number[]
	| Float32Array;

export type WaveShaperNodeConfig = {
	curve: WaveShapperCurve;
	oversample?: OverSampleType;
};

export interface WaveShaperNodeCreator {
	create(context: BaseContext, config: WaveShaperNodeConfig): WaveShaperNode;
}

export let WaveShaperNode: WaveShaperNodeCreator;
