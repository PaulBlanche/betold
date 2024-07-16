/** @import * as self from "./WaveShaperNode.js" */
import { mixin } from "../utils/mixin.js";
import { AudioNode } from "./node/AudioNode.js";

/** @type {self.WaveShaperNodeCreator} */
export const WaveShaperNode = {
	create,
};

/** @type {self.WaveShaperNodeCreator['create']} */
function create(context, config) {
	const curve = _float32Curve(config.curve);
	const oversample = config.oversample ?? "none";

	const state = {
		waveShaperNode: context._audioContext.createWaveShaper(),
	};
	state.waveShaperNode.curve = curve;
	state.waveShaperNode.oversample = oversample;

	const passthrough = AudioNode.passthrough({
		sink: state.waveShaperNode,
		source: state.waveShaperNode,
	});

	const self = mixin(passthrough, {
		get curve() {
			return curve;
		},
		get oversample() {
			return state.waveShaperNode.oversample;
		},

		dispose,
	});

	context.register(self);

	return self;

	function dispose() {
		state.waveShaperNode.disconnect();
		state.waveShaperNode = /** @type {any} */ (undefined);

		passthrough.dispose();

		context.deregister(self);
	}

	/**
	 * @param {self.WaveShapperCurve} curve
	 * @returns {Float32Array}
	 */
	function _float32Curve(curve) {
		if (curve instanceof Float32Array) {
			return curve;
		}
		if (Array.isArray(curve)) {
			return Float32Array.from(curve);
		}

		const float32Curve = new Float32Array(curve.length ?? 1024);
		for (let i = 0; i < float32Curve.length; i++) {
			const normalized = (i / (float32Curve.length - 1)) * 2 - 1;
			float32Curve[i] = curve.mapping(normalized, i);
		}

		return float32Curve;
	}
}
