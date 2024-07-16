/** @import * as self from "./Multiply.js" */
import { GainNode } from "../../core/GainNode.js";
import { AudioNode } from "../../core/node/AudioNode.js";
import { mixin } from "../../utils/mixin.js";

/** @type {self.MultiplyCreator} */
export const Abs = {
	create,
};

/** @type {self.MultiplyCreator['create']} */
function create(context, config) {
	const audioSources = config.sources.filter(
		(source) => typeof source !== "number",
	);
	const scalarSources = config.sources.filter(
		(source) => typeof source === "number",
	);

	if (audioSources.length < 1) {
		throw Error('Multiply needs at least one AudioNode in "sources"');
	}

	/** @type {GainNode[]} */
	const gains = [];

	// gain first audio source by the product of all scalars
	let multiplier = GainNode.create(context, {
		gain: scalarSources.reduce((scalar, value) => scalar * value, 1),
	});
	gains.push(multiplier);

	audioSources[0].connectAudio(multiplier);

	// cascade each audio signal in gains
	//	A -> G1 ->  G2 -> G3 ...
	//		^      ^     ^
	//		|      |     |
	//		B      C     D
	for (let i = 1; i < audioSources.length; i++) {
		const nextMultiplier = GainNode.create(context);
		gains.push(nextMultiplier);
		audioSources[i].connectAudio(nextMultiplier.gain);
		multiplier.connectAudio(nextMultiplier);
		multiplier = nextMultiplier;
	}

	const passthrough = AudioNode.source({
		source: multiplier,
	});

	return mixin(passthrough, {
		dispose,
	});

	function dispose() {
		for (const gain of gains) {
			gain.dispose();
		}
	}
}
