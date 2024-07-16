/** @import * as self from "./Add.js" */
import { GainNode } from "../../core/GainNode.js";
import { AudioNode } from "../../core/node/AudioNode.js";
import { mixin } from "../../utils/mixin.js";

/** @type {self.AddCreator} */
export const Add = {
	create,
};

/** @type {self.AddCreator['create']} */
function create(context, config) {
	const adder = GainNode.create(context, {
		gain: 0,
	});

	for (const source of config.sources) {
		source.connectAudio(adder);
	}

	const passthrough = AudioNode.source({
		source: adder,
	});

	return mixin(passthrough, {
		dispose,
	});

	function dispose() {
		adder.dispose();
	}
}
