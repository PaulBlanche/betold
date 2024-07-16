/** @import * as self from "./BeatFrequency.js" */
import { mixin, omit } from "../../utils/mixin.js";
import { BeatFrequencyParam } from "./BeatFrequencyParam.js";

/** @type {self.BeatFrequencyCreator} */
export const BeatFrequency = {
	create,
};

/** @type {self.BeatFrequencyCreator['create']} */
function create(context, config) {
	const state = {
		constantSource: context._audioContext.createConstantSource(),
	};
	state.constantSource.start();

	const beatFrequency = BeatFrequencyParam.create(context, {
		audioParam: state.constantSource.offset,
		defaultBeatFrequency: config.defaultBeatFrequency,
	});

	return mixin(omit(beatFrequency, ["dispose"]), {
		dispose,
	});

	function dispose() {
		state.constantSource.disconnect();
		state.constantSource.stop();
		state.constantSource = /** @type {any} */ (undefined);

		beatFrequency.dispose();
	}
}
