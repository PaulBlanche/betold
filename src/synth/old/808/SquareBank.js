/** @import * as self from "./SquareBank.js" */

import { Gain } from "../../core/GainNode.js";
import { Oscillator } from "../../core/OscillatorNode.js";
import { AudioNode } from "../../core/node/AudioNode.js";

/** @type {self.SquareBankCreator} */
export const SquareBank = {
	create,
};

const FREQUENCIES = [263, 400, 421, 474, 587, 845];

/** @type {self.SquareBankCreator['create']} */
function create(context) {
	/** @type {{ oscillator: Oscillator, gain: Gain}[]} */
	const oscillators = [];

	for (const frequency of FREQUENCIES) {
		const oscillator = Oscillator.create(context, {
			type: "square",
			frequency,
		});

		const gain = Gain.create(context, {
			gain: 0.3,
		});

		oscillator.connectAudio(gain);

		oscillators.push({ oscillator, gain });

		oscillator.start(0);
	}

	return {
		get oscillators() {
			return oscillators.map((entry) => entry.gain);
		},

		dispose,
	};

	function dispose() {
		for (const { gain, oscillator } of oscillators) {
			gain.dispose();
			oscillator.dispose();
		}
	}
}
