/** @import * as self from "./RangeToRange.js" */

import { WaveShaperNode } from "../../core/WaveShaperNode.js";
import { AudioNode } from "../../core/node/AudioNode.js";
import * as guard from "../../utils/guard.js";
import { mixin } from "../../utils/mixin.js";

/** @type {self.RangeToRangeCreator} */
export const RangeToRange = {
	create,
};

/** @type {self.RangeToRangeCreator['create']} */
function create(context, config) {
	guard.range(config.outputRange[0], -1, 1);
	guard.range(config.outputRange[1], -1, 1);
	guard.range(config.inputRange[0], -1, 1);
	guard.range(config.inputRange[1], -1, 1);

	const y0 = config.outputRange[0];
	const y1 = config.outputRange[1];
	const x0 = config.inputRange[0];
	const x1 = config.inputRange[1];
	const a = (y1 - y0) / (x1 - x0);
	const b = (y0 * x1 - y1 * x0) / (x1 - x0);
	const waveShaper = WaveShaperNode.create(context, {
		curve: {
			mapping: (value) => a * value + b,
			length: 1024,
		},
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
