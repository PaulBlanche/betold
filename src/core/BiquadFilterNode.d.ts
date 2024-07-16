import type { BaseContext } from "./BaseContext.js";
import type { AudioPassThrough } from "./node/AudioNode.js";
import type { DisposableNode } from "./node/DisposableNode.js";
import type { AudioRateParam } from "./param/AudioRateParam.js";

interface BiquadFilterNode extends AudioPassThrough<AudioNode>, DisposableNode {
	readonly frequency: AudioRateParam;
	readonly detune: AudioRateParam;
	readonly Q: AudioRateParam;
	readonly gain: AudioRateParam;
	readonly type: BiquadFilterType;
}

type BiquadFilterNodeConfig = {
	type: BiquadFilterType;
	frequency?: number;
	detune?: number;
	Q?: number;
	gain?: number;
};

interface BiquadFilterNodeCreator {
	create(
		context: BaseContext,
		config: BiquadFilterNodeConfig,
	): BiquadFilterNode;
}

export let BiquadFilterNode: BiquadFilterNodeCreator;
