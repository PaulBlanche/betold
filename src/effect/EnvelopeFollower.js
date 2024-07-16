/** @import * as self from "./EnvelopeFollower.js" */
import { BiquadFilterNode } from "../core/BiquadFilterNode";
import { AudioNode } from "../core/node/AudioNode";
import { Abs } from "../cv/audiorate/Abs";
import { mixin } from "../utils/mixin";

/** @type {self.EnvelopeFollowerCreator}*/
export const EnvelopeFollower = {
	create,
};

/**
 *             +-----+     +---------+
 *  input  --> | abs | --> | lowpass | -->  output
 *             +-----+     +---------+
 *
 * @type {self.EnvelopeFollowerCreator['create']}*/
function create(context, config = {}) {
	const smoothing = config.smoothing ?? 0.05;

	const abs = Abs.create(context);

	const lowpass = BiquadFilterNode.create(context, {
		type: "lowpass",
		frequency: 1 / smoothing,
	});

	abs.connectAudio(lowpass);

	const passthrough = AudioNode.passthrough({
		sink: abs,
		source: lowpass,
	});

	return mixin(passthrough, {
		dispose,
	});

	function dispose() {
		abs.dispose();
		lowpass.dispose();
	}
}
