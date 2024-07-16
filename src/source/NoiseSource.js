/** @import * as self from "./NoiseSource.js" */
import { BaseContext } from "../core/BaseContext.js";
import { BufferSourceNode } from "../core/BufferSourceNode.js";

/** @type {self.NoiseSourceCreator} */
export const NoiseSource = {
	create,
};

/** @type {self.NoiseSourceCreator['create']} */
function create(context) {
	const bufferSource = BufferSourceNode.create(context, {
		buffer: _getNoiseBuffer(context),
		loop: "oscillator",
	});

	return bufferSource;
}

/** @type {AudioBuffer|undefined} */
let NOISE_BUFFER_CACHE = undefined;

/**
 * @param {BaseContext} context
 * @returns {AudioBuffer}
 */
function _getNoiseBuffer(context) {
	if (NOISE_BUFFER_CACHE === undefined) {
		const length = context.sampleRate * 3;
		const audioBuffer = context._audioContext.createBuffer(
			1,
			length,
			context.sampleRate,
		);

		const buffer = audioBuffer.getChannelData(0);

		for (let i = 0; i < buffer.length; i++) {
			buffer[i] = Math.random() * 2 - 1;
		}

		NOISE_BUFFER_CACHE = audioBuffer;
	}

	return NOISE_BUFFER_CACHE;
}
