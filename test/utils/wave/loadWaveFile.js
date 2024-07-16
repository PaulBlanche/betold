/**
 * @param {import("../../../src/core/BaseContext.js").BaseContext} context
 * @param {string} filename
 */
export async function loadWaveFile(context, filename) {
	const response = await fetch(filename);
	const buffer = await response.arrayBuffer();
	return await context._audioContext.decodeAudioData(buffer);
}
