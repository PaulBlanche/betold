import type { BaseContext } from "./BaseContext";
import type { AudioPassThrough } from "./node/AudioNode";
import type { DisposableNode } from "./node/DisposableNode";
import type { AudioRateParam } from "./param/AudioRateParam";
import type { BaseParamConfig } from "./param/BaseParam";

export interface ConstantSourceNode
	extends AudioRateParam,
		AudioPassThrough<AudioParam>,
		DisposableNode {}

interface ConstantSourceNodeCreator {
	create(context: BaseContext, config: BaseParamConfig): ConstantSourceNode;
}

export let ConstantSourceNode: ConstantSourceNodeCreator;
