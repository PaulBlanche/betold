import type { BaseContext } from "./BaseContext.js";
import type { AudioPassThrough } from "./node/AudioNode.js";
import type { DisposableNode } from "./node/DisposableNode.js";

interface IIRFilterNode extends AudioPassThrough<AudioNode>, DisposableNode {
	getFrequencyResponse(
		frequency: Float32Array,
		magResponse: Float32Array,
		phaseResponse: Float32Array,
	): void;
}

type IIRFilterNodeConfig = {
	feedforward: number[];
	feedback: number[];
};

interface IIRFilterNodeCreator {
	create(context: BaseContext, config: IIRFilterNodeConfig): IIRFilterNode;
}

export let IIRFilterNode: IIRFilterNodeCreator;
