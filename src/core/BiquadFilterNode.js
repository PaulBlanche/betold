/** @import * as self from "./BiquadFilterNode.js" */
import { mixin } from "../utils/mixin.js";
import { AudioNode } from "./node/AudioNode.js";
import { AudioRateParam } from "./param/AudioRateParam.js";

/** @type {self.BiquadFilterNodeCreator} */
export const BiquadFilterNode = {
	create,
};

/** @type {self.BiquadFilterNodeCreator['create']} */
function create(context, config) {
	const state = {
		biquadFilterNode: context._audioContext.createBiquadFilter(),
	};
	state.biquadFilterNode.type = config.type;

	const frequencyParam = AudioRateParam.create(context, {
		audioParam: state.biquadFilterNode.frequency,
		defaultValue: config.frequency,
		min: 0,
	});

	const detuneParam = AudioRateParam.create(context, {
		audioParam: state.biquadFilterNode.detune,
		defaultValue: config.detune,
	});

	const QParam = AudioRateParam.create(context, {
		audioParam: state.biquadFilterNode.Q,
		defaultValue: config.Q,
	});

	const gainParam = AudioRateParam.create(context, {
		audioParam: state.biquadFilterNode.gain,
		defaultValue: config.gain,
	});

	const passthrough = AudioNode.passthrough({
		sink: state.biquadFilterNode,
		source: state.biquadFilterNode,
	});

	const self = mixin(passthrough, {
		get frequency() {
			return frequencyParam;
		},
		get detune() {
			return detuneParam;
		},
		get Q() {
			return QParam;
		},
		get gain() {
			return gainParam;
		},
		get type() {
			return config.type;
		},

		dispose,
	});

	context.register(self);

	return self;

	function dispose() {
		state.biquadFilterNode.disconnect();
		state.biquadFilterNode = /** @type {any} */ (undefined);

		frequencyParam.dispose();
		detuneParam.dispose();
		QParam.dispose();
		gainParam.dispose();
		passthrough.dispose();

		context.deregister(self);
	}
}
