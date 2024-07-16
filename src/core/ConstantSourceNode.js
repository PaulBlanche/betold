/** @import * as self from "./ConstantSourceNode.js" */
import { mixin } from "../utils/mixin.js";
import { AudioNode } from "./node/AudioNode.js";
import { AudioRateParam } from "./param/AudioRateParam.js";

/** @type {self.ConstantSourceNodeCreator} */
export const ConstantSourceNode = {
	create,
};

/** @type {self.ConstantSourceNodeCreator['create']} */
function create(context, config) {
	const state = {
		constantSource: context._audioContext.createConstantSource(),
	};
	state.constantSource.start(0);

	const offset = AudioRateParam.create(context, {
		audioParam: state.constantSource.offset,
		defaultValue: config.defaultValue,
		min: config.min,
		max: config.max,
	});

	const passthrough = AudioNode.passthrough({
		sink: state.constantSource.offset,
		source: state.constantSource,
	});

	const self = mixin(offset, passthrough, {
		dispose,
	});

	context.register(self);

	return self;

	function dispose() {
		state.constantSource.disconnect();
		state.constantSource.stop();
		state.constantSource = /** @type {any}*/ (undefined);

		offset.dispose();
		passthrough.dispose();

		context.deregister(self);
	}
}
