/** @import * as self from "./OscillatorSource.js" */
/** @import { BuiltinOscillatorType, PartialableType } from "../core/OscillatorNode.js" */
import { OscillatorNode } from "../core/OscillatorNode.js";
import { mixin, omit } from "../utils/mixin.js";

/** @type {self.OscillatorSourceCreator} */
export const OscillatorSource = {
	create,
};

/** @type {self.OscillatorSourceCreator['create']} */
function create(context, config) {
	const oscillator = _createOscillator();

	return mixin(omit(oscillator, ["type"]), {
		get type() {
			return config.type;
		},
	});

	function _createOscillator() {
		if (config.type === "custom") {
			return OscillatorNode.create(context, {
				frequency: config.frequency,
				detune: config.detune,
				type: "custom",
				periodicWave: config.wave,
			});
		}

		if (config.type === "sine") {
			if (config.phase !== undefined && config.phase !== 0) {
				const { real, imag } = _getRealImag("sine", {
					phase: config.phase,
				});

				return OscillatorNode.create(context, {
					frequency: config.frequency,
					detune: config.detune,
					type: "custom",
					periodicWave: context.createPeriodicWave(real, imag),
				});
			}

			return OscillatorNode.create(context, {
				frequency: config.frequency,
				detune: config.detune,
				type: "sine",
			});
		}

		if (
			(config.phase !== undefined && config.phase !== 0) ||
			(config.harmonics !== undefined && config.harmonics !== 0)
		) {
			const { real, imag } = _getRealImag(config.type, {
				harmonics: config.harmonics,
				phase: config.phase,
			});

			return OscillatorNode.create(context, {
				frequency: config.frequency,
				detune: config.detune,
				type: "custom",
				periodicWave: context.createPeriodicWave(real, imag),
			});
		}

		return OscillatorNode.create(context, {
			frequency: config.frequency,
			detune: config.detune,
			type: config.type,
		});
	}
}

/**
 * @param {BuiltinOscillatorType} type
 * @param {{ harmonics?: number, phase?:number }=} config
 */
function _getRealImag(type, { harmonics = 2048, phase = 0 } = {}) {
	if (type === "sine") {
		const real = new Float32Array(2);
		const imag = new Float32Array(2);

		real[0] = 0;
		imag[0] = 0;
		real[1] = -1 * Math.sin(phase);
		imag[1] = 1 * Math.cos(phase);

		return { real, imag };
	}

	const real = new Float32Array(harmonics + 1);
	const imag = new Float32Array(harmonics + 1);

	for (let n = 1; n <= harmonics; n++) {
		const bn = _b(type, n);

		real[n] = -bn * Math.sin(phase * n);
		imag[n] = bn * Math.cos(phase * n);
	}

	return { real, imag };
}

/**
 *
 * @param {PartialableType} type
 * @param {number} n
 */
function _b(type, n) {
	const twoOverNPi = 2 / (n * Math.PI);
	switch (type) {
		case "square": {
			return (n % 2 === 0 ? 0 : 1) * twoOverNPi;
		}
		case "sawtooth": {
			return (n % 2 === 0 ? -1 : 1) * twoOverNPi;
		}
		case "triangle": {
			return (n % 2 === 0 ? 0 : n % 4 === 1 ? 1 : -1) * twoOverNPi ** 2 * 2;
		}
	}
}
