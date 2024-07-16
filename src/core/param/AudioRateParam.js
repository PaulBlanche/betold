/** @import * as self from "./AudioRateParam.js" */
import { mixin, omit } from "../../utils/mixin.js";
import { AudioNode } from "../node/AudioNode.js";
import { BaseParam } from "./BaseParam.js";

/** @type {self.AudioRateParamCreator} */
export const AudioRateParam = {
	create,
};

/** @type {self.AudioRateParamCreator['create']} */
function create(context, config) {
	const audioParam =
		"sink" in config.audioParam ? config.audioParam._param : config.audioParam;

	const min =
		config.min ??
		("sink" in config.audioParam
			? config.audioParam.min
			: config.audioParam.minValue);

	const max =
		config.max ??
		("sink" in config.audioParam
			? config.audioParam.max
			: config.audioParam.maxValue);

	const baseParam = BaseParam.create(context, {
		audioParam,
		defaultValue: config.defaultValue ?? config.audioParam.defaultValue,
		min,
		max,
	});

	const node = AudioNode.sink({
		sink: audioParam,
	});

	return mixin(omit(baseParam, ["dispose"]), omit(node, ["dispose"]), {
		get _param() {
			return audioParam;
		},

		dispose,
	});

	function dispose() {
		node.dispose();
		baseParam.dispose();
	}
}
