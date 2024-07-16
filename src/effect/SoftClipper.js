/** @import * as self from "./SoftClipper.js" */
import { WaveShaperNode } from "../core/WaveShaperNode.js";
import { AudioNode } from "../core/node/AudioNode.js";
import { mixin } from "../utils/mixin.js";

/** @type {self.SoftClipperCreator} */
export const SoftClipper = {
	create,
};

/** @type {self.SoftClipperCreator['create']} */
function create(context) {
	const shaper = WaveShaperNode.create(context, {
		oversample: "2x",
		curve: {
			mapping: (value) => Math.tanh(value),
			length: 10,
		},
	});

	const passtrough = AudioNode.passthrough({
		sink: shaper,
		source: shaper,
	});

	return mixin(passtrough, {
		dispose,
	});

	function dispose() {
		shaper.dispose();
	}
}
