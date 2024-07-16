import { BaseContext } from "../../../src/core/BaseContext.js";
import { fft } from "./fft.js";
import * as windowing from "./windowing.js";

/**
 * @param {AudioBuffer} buffer
 */
export function signal(buffer) {
	/** @type {number[][]} */
	const signal = [];

	for (let c = 0; c < buffer.numberOfChannels; c += 1) {
		const channel = buffer.getChannelData(c);
		signal[c] = [];

		for (let s = 0; s < channel.length; s += 1) {
			signal[c].push(channel[s]);
		}
	}

	return signal;
}

/**
 * @param {AudioBuffer} buffer
 * @param {{ fftSize?: number, hopSize?: number }=} config
 */
export function spectrum(buffer, { fftSize = 256, hopSize = 128 } = {}) {
	/** @type {number[][][]} */
	const spectrum = [];
	for (let c = 0; c < buffer.numberOfChannels; c += 1) {
		const channel = buffer.getChannelData(c);
		spectrum[c] = [];

		for (let i = 0; i < channel.length - fftSize; i += hopSize) {
			const segment = windowing.blackman_harris(channel.slice(i, i + fftSize));
			spectrum[c].push(fft(segment));
		}
	}

	return spectrum;
}

/**
 * @param {BaseContext} context
 * @param {AudioBuffer} buffer
 */
function toMono(context, buffer) {
	const monoBuffer = context._audioContext.createBuffer(
		1,
		buffer.length,
		buffer.sampleRate,
	);
	const monoChannel = monoBuffer.getChannelData(0);

	for (let i = 0; i < buffer.numberOfChannels; i += 1) {
		const channel = buffer.getChannelData(i);
		for (let s = 0; s < channel.length; s++) {
			monoChannel[s] += channel[s];
		}
	}

	return monoBuffer;
}
