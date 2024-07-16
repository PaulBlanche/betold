/** @import * as self from "./DelayNode.js" */
import { mixin } from "../utils/mixin.js";
import { AudioNode } from "./node/AudioNode.js";
import { AudioRateParam } from "./param/AudioRateParam.js";

/** @type {self.DelayNodeCreator} */
export const DelayNode = {
	create,
};

/** @type {self.DelayNodeCreator['create']} */
export function create(context, config) {
	const state = {
		delay: context._audioContext.createDelay(),
	};

	const delayTime = AudioRateParam.create(context, {
		audioParam: state.delay.delayTime,
		defaultValue: config.delayTime,
	});

	const passthrough = AudioNode.passthrough({
		sink: state.delay,
		source: state.delay,
	});

	const self = mixin(passthrough, {
		get delayTime() {
			return delayTime;
		},

		dispose,
	});

	context.register(self);

	return self;

	function dispose() {
		state.delay.disconnect();
		state.delay = /** @type {any} */ (undefined);

		delayTime.dispose();
		passthrough.dispose();

		context.deregister(self);
	}
}
