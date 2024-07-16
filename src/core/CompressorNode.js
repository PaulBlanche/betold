/** @import * as self from "./CompressorNode.js" */
import { mixin } from "../utils/mixin.js";
import { AudioNode } from "./node/AudioNode.js";
import { AudioRateParam } from "./param/AudioRateParam.js";

/** @type {self.CompressorNodeCreator} */
export const CompressorNode = {
	create,
};

/** @type {self.CompressorNodeCreator['create']} */
function create(context, config) {
	const state = {
		compressorNode: context._audioContext.createDynamicsCompressor(),
	};
	const thresholdParam = AudioRateParam.create(context, {
		audioParam: state.compressorNode.threshold,
		defaultValue: config.threshold,
	});

	const kneeParam = AudioRateParam.create(context, {
		audioParam: state.compressorNode.knee,
		defaultValue: config.knee,
	});

	const ratioParam = AudioRateParam.create(context, {
		audioParam: state.compressorNode.ratio,
		defaultValue: config.ratio,
	});

	const attackParam = AudioRateParam.create(context, {
		audioParam: state.compressorNode.attack,
		defaultValue: config.attack,
	});

	const releaseParam = AudioRateParam.create(context, {
		audioParam: state.compressorNode.release,
		defaultValue: config.release,
	});

	const passthrough = AudioNode.passthrough({
		sink: state.compressorNode,
		source: state.compressorNode,
	});

	const self = mixin(passthrough, {
		get threshold() {
			return thresholdParam;
		},
		get knee() {
			return kneeParam;
		},
		get ratio() {
			return ratioParam;
		},
		get attack() {
			return attackParam;
		},
		get release() {
			return releaseParam;
		},
		get reduction() {
			return state.compressorNode.reduction;
		},

		dispose,
	});

	context.register(self);

	return self;

	function dispose() {
		state.compressorNode.disconnect();
		state.compressorNode = /** @type {any} */ (undefined);

		thresholdParam.dispose();
		kneeParam.dispose();
		ratioParam.dispose();
		attackParam.dispose();
		releaseParam.dispose();
		passthrough.dispose();

		context.deregister(self);
	}
}
