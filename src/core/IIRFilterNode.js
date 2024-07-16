/** @import * as self from "./IIRFilterNode.js" */
import { mixin } from "../utils/mixin.js";
import { AudioNode } from "./node/AudioNode.js";

/** @type {self.IIRFilterNodeCreator} */
export const IIRFilter = {
	create,
};

/** @type {self.IIRFilterNodeCreator['create']} */
function create(context, config) {
	const state = {
		iirFilterNode: context._audioContext.createIIRFilter(
			config.feedforward,
			config.feedback,
		),
	};

	const passthrough = AudioNode.passthrough({
		sink: state.iirFilterNode,
		source: state.iirFilterNode,
	});

	const self = mixin(passthrough, {
		getFrequencyResponse,
		dispose,
	});

	context.register(self);

	return self;

	/** @type {self.IIRFilterNode['getFrequencyResponse']} */
	function getFrequencyResponse(
		frequency,
		magResponseOutput,
		phaseResponseOutput,
	) {
		state.iirFilterNode.getFrequencyResponse(
			frequency,
			magResponseOutput,
			phaseResponseOutput,
		);
	}

	function dispose() {
		state.iirFilterNode.disconnect();
		state.iirFilterNode = /** @type {any} */ (undefined);

		passthrough.dispose();

		context.deregister(self);
	}
}
