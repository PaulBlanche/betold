/** @import * as self from "./PulseSource.js" */
import { ConstantSourceNode } from "../core/ConstantSourceNode.js";
import { OscillatorNode } from "../core/OscillatorNode.js";
import { WaveShaperNode } from "../core/WaveShaperNode.js";
import { AudioNode } from "../core/node/AudioNode.js";
import { Add } from "../cv/audiorate/Add.js";
import { RangeToRange } from "../cv/audiorate/RangeToRange.js";
import { mixin, omit } from "../utils/mixin.js";

/** @type {self.PulseSourceCreator} */
export const PulseSource = {
	create,
};

/** @type {self.PulseSourceCreator['create']} */
function create(context, config) {
	const oscillator = OscillatorNode.create(context, {
		frequency: config.frequency,
		detune: config.detune,
		type: "sawtooth",
	});

	const widthParam = ConstantSourceNode.create(context, {
		min: 0,
		max: 1,
		defaultValue: 0.5,
	});

	const rangeToRange = RangeToRange.create(context, {
		inputRange: [0, 1],
		outputRange: [-1, 1],
	});

	const threshold = WaveShaperNode.create(context, {
		curve: {
			mapping: (value) => (value <= 0 ? -1 : 1),
		},
	});

	widthParam.connectAudio(rangeToRange);
	const added = Add.create(context, {
		sources: [oscillator, rangeToRange],
	});
	added.connectAudio(threshold);

	const source = AudioNode.source({
		source: threshold,
	});

	return mixin(
		omit(oscillator, [
			"source",
			"numberOfOutputs",
			"connectAudio",
			"disconnectAudio",
		]),
		source,
		{
			get width() {
				return widthParam;
			},
		},
	);
}
