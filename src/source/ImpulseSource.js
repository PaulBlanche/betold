/** @import * as self from "./ImpulseSource.js" */
import { ConstantSourceNode } from "../core/ConstantSourceNode.js";
import { AudioNode } from "../core/node/AudioNode.js";
import { mixin } from "../utils/mixin.js";

/** @type {self.ImpulseSourceCreator} */
export const PulseSource = {
	create,
};

/** @type {self.ImpulseSourceCreator['create']} */
function create(context, config = {}) {
	const cv = ConstantSourceNode.create(context, {
		min: 0,
		max: 1,
		defaultValue: 0,
	});

	/** @type {(cv: ConstantSourceNode, time:number) => void} */
	const curve =
		"duration" in config
			? (cv, time) => {
					cv.setValueCurveAtTime(config.curve, time, config.duration);
				}
			: "curve" in config
				? config.curve
				: (cv, time) => {
						cv.setValueAtTime(1, time);
						cv.setValueAtTime(0, time + (config.width ?? 0.001));
					};

	const source = AudioNode.source({
		source: cv,
	});

	return mixin(source, {
		trigger,
		dispose,
	});

	/** @type {self.ImpulseSource['trigger']} */
	function trigger(dirtyTime) {
		const time = Math.max(context.currentTime, dirtyTime);

		curve(cv, time);
	}

	function dispose() {
		return cv.dispose();
	}
}
