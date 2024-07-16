/** @import * as self from "./Abs.js" */
import { WaveShaperNode } from "../../core/WaveShaperNode.js";
import { AudioNode } from "../../core/node/AudioNode.js";
import { mixin } from "../../utils/mixin.js";

/** @type {self.AbsCreator} */
export const Abs = {
	create,
};

/** @type {self.AbsCreator['create']} */
function create(context) {
	const waveShaper = WaveShaperNode.create(context, {
		curve: { mapping: (value) => Math.abs(value), length: 1024 },
	});

	const passtrough = AudioNode.passthrough({
		sink: waveShaper,
		source: waveShaper,
	});

	return mixin(passtrough, {
		dispose,
	});

	function dispose() {
		waveShaper.dispose();
	}
}
