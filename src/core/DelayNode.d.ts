import type { BaseContext } from "./BaseContext.js";
import type { AudioPassThrough } from "./node/AudioNode.js";
import type { DisposableNode } from "./node/DisposableNode.js";
import type { AudioRateParam } from "./param/AudioRateParam.js";

interface DelayNode extends AudioPassThrough<AudioNode>, DisposableNode {
	readonly delayTime: AudioRateParam;
}

type DelayNodeConfig = {
	delayTime?: number;
};

interface DelayNodeCreator {
	create(context: BaseContext, config: DelayNodeConfig): DelayNode;
}

export let DelayNode: DelayNodeCreator;
