/**
 * @param {string} filename
 * @param {AudioBuffer} audioBuffer
 */
export async function saveWaveFile(filename, audioBuffer) {
	// Float32Array samples
	const [left, right] = [
		audioBuffer.getChannelData(0),
		audioBuffer.getChannelData(1),
	];

	// interleaved
	const interleaved = new Float32Array(left.length + right.length);
	for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
		interleaved[dst] = left[src];
		interleaved[dst + 1] = right[src];
	}

	const wavBytes = getWavBytes(interleaved.buffer, {
		isFloat: true, // floating point or 16-bit integer
		numChannels: 2,
		sampleRate: audioBuffer.sampleRate,
	});

	const wav = new Blob([wavBytes], { type: "audio/wav" });

	// create download link and append to Dom
	const downloadLink = document.createElement("a");
	downloadLink.href = URL.createObjectURL(wav);
	downloadLink.setAttribute("download", filename); // name file

	downloadLink.click();

	await new Promise((res) => setTimeout(res, 1000 * 3));
}

/**
 *
 * @param {ArrayBuffer} buffer
 * @param {{ numChannels?: number, sampleRate?: number, isFloat: boolean}} options
 * @returns {Uint8Array}
 */
function getWavBytes(buffer, options) {
	const type = options.isFloat ? Float32Array : Uint16Array;
	const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT;

	const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }));
	const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

	// prepend header, then add pcmBytes
	wavBytes.set(headerBytes, 0);
	wavBytes.set(new Uint8Array(buffer), headerBytes.length);

	return wavBytes;
}

/**
 * @see https://gist.github.com/also/900023
 * @param {{ numFrames: number, numChannels?: number, sampleRate?: number, isFloat: boolean}} options
 * @returns {Uint8Array}
 */
function getWavHeader(options) {
	const numFrames = options.numFrames;
	const numChannels = options.numChannels || 2;
	const sampleRate = options.sampleRate || 44100;
	const bytesPerSample = options.isFloat ? 4 : 2;
	const format = options.isFloat ? 3 : 1;

	const blockAlign = numChannels * bytesPerSample;
	const byteRate = sampleRate * blockAlign;
	const dataSize = numFrames * blockAlign;

	const buffer = new ArrayBuffer(44);
	const dv = new DataView(buffer);

	let p = 0;

	writeString("RIFF"); // ChunkID
	writeUint32(dataSize + 36); // ChunkSize
	writeString("WAVE"); // Format
	writeString("fmt "); // Subchunk1ID
	writeUint32(16); // Subchunk1Size
	writeUint16(format); // AudioFormat https://i.sstatic.net/BuSmb.png
	writeUint16(numChannels); // NumChannels
	writeUint32(sampleRate); // SampleRate
	writeUint32(byteRate); // ByteRate
	writeUint16(blockAlign); // BlockAlign
	writeUint16(bytesPerSample * 8); // BitsPerSample
	writeString("data"); // Subchunk2ID
	writeUint32(dataSize); // Subchunk2Size

	return new Uint8Array(buffer);

	/**
	 * @param {string} string
	 */
	function writeString(string) {
		for (let i = 0; i < string.length; i++) {
			dv.setUint8(p + i, string.charCodeAt(i));
		}
		p += string.length;
	}

	/**
	 * @param {number} number
	 */
	function writeUint32(number) {
		dv.setUint32(p, number, true);
		p += 4;
	}

	/**
	 * @param {number} number
	 */
	function writeUint16(number) {
		dv.setUint16(p, number, true);
		p += 2;
	}
}
