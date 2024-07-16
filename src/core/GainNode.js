/** @import * as self from "./GainNode.js" */
import { mixin } from "../utils/mixin.js";
import { AudioNode } from "./node/AudioNode.js";
import { AudioRateParam } from "./param/AudioRateParam.js";

/** @type {self.GainNodeCreator} */
export const GainNode = {
	create,
};

/** @type {self.GainNodeCreator['create']} */
function create(context, config = {}) {
	const state = {
		gainNode: context._audioContext.createGain(),
	};

	const gainParam = AudioRateParam.create(context, {
		audioParam: state.gainNode.gain,
		defaultValue: config.gain,
	});

	const passthrough = AudioNode.passthrough({
		sink: state.gainNode,
		source: state.gainNode,
	});

	const self = mixin(passthrough, {
		get gain() {
			return gainParam;
		},

		dispose,
	});

	context.register(self);

	return self;

	function dispose() {
		state.gainNode.disconnect();
		state.gainNode = /** @type {any}*/ (undefined);

		gainParam.dispose();
		passthrough.dispose();

		context.deregister(self);
	}
}
