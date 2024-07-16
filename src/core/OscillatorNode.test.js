import { assert } from "../../test/assert.js";
import * as anlalyse from "../../test/utils/analysis/analyse.js";
import * as stats from "../../test/utils/stats.js";
import { loadWaveFile } from "../../test/utils/wave/loadWaveFile.js";
import { withOfflineContext } from "../../test/withContext.js";
import { OscillatorNode } from "./OscillatorNode.js";

const SPECTRUM_TOLERANCE = 1 / 100;
const SIGNAL_TOLERANCE = 1 / 100;

suite("OscillatorNode", () => {
	test("output the expected sound", () => {
		return withOfflineContext(
			{ length: 0.2, sampleRate: 44100 },
			async (context) => {
				const oscillator = OscillatorNode.create(context, {
					type: "sawtooth",
					frequency: 440,
				});
				oscillator.connectAudio(context.destination);
				oscillator.start(0);

				const actual = await context.startRendering();

				const expected = await loadWaveFile(
					context,
					"../../test/fixtures/sawtooth-f440-t200ms.wav",
				);

				assert.isAtMost(
					stats.rmse(
						anlalyse.spectrum(actual, { fftSize: 1024, hopSize: 64 }).flat(2),
						anlalyse.spectrum(expected, { fftSize: 1024, hopSize: 64 }).flat(2),
					),
					SPECTRUM_TOLERANCE,
				);
				assert.isAtMost(
					stats.rmse(
						anlalyse.signal(actual).flat(),
						anlalyse.signal(expected).flat(),
					),
					SIGNAL_TOLERANCE,
				);
			},
		);
	});

	test("has a controlable frequency", () => {
		return withOfflineContext(
			{ length: 0.2, sampleRate: 44100 },
			async (context) => {
				const oscillator = OscillatorNode.create(context, {
					type: "sawtooth",
					frequency: 440,
				});
				oscillator.connectAudio(context.destination);
				oscillator.start(0);

				oscillator.frequency.setValueAtTime(440, 0);
				oscillator.frequency.setRampTo(880, { endTime: 0.2 });

				const actual = await context.startRendering();

				const expected = await loadWaveFile(
					context,
					"../../test/fixtures/sawtooth-f440:880-t200ms.wav",
				);

				assert.isAtMost(
					stats.rmse(
						anlalyse.spectrum(actual, { fftSize: 1024, hopSize: 64 }).flat(2),
						anlalyse.spectrum(expected, { fftSize: 1024, hopSize: 64 }).flat(2),
					),
					SPECTRUM_TOLERANCE,
				);
				assert.isAtMost(
					stats.rmse(
						anlalyse.signal(actual).flat(),
						anlalyse.signal(expected).flat(),
					),
					SIGNAL_TOLERANCE,
				);
			},
		);
	});

	test("has a controlable detune", () => {
		return withOfflineContext(
			{ length: 0.2, sampleRate: 44100 },
			async (context) => {
				const oscillator = OscillatorNode.create(context, {
					type: "sawtooth",
					frequency: 440,
				});
				oscillator.connectAudio(context.destination);
				oscillator.start(0);

				oscillator.detune.setValueAtTime(0, 0);
				oscillator.detune.setRampTo(1200, { endTime: 0.2 });

				const actual = await context.startRendering();

				const expected = await loadWaveFile(
					context,
					"../../test/fixtures/sawtooth-f440-d0:1200-t200ms.wav",
				);

				assert.isAtMost(
					stats.rmse(
						anlalyse.spectrum(actual, { fftSize: 1024, hopSize: 64 }).flat(2),
						anlalyse.spectrum(expected, { fftSize: 1024, hopSize: 64 }).flat(2),
					),
					SPECTRUM_TOLERANCE,
				);
				assert.isAtMost(
					stats.rmse(
						anlalyse.signal(actual).flat(),
						anlalyse.signal(expected).flat(),
					),
					SIGNAL_TOLERANCE,
				);
			},
		);
	});

	test("can have a custom periodic wave", () => {
		return withOfflineContext(
			{ length: 0.2, sampleRate: 44100 },
			async (context) => {
				const oscillator = OscillatorNode.create(context, {
					type: "custom",
					frequency: 440,
					periodicWave: context._audioContext.createPeriodicWave(
						[0.5, 0.1, 0.9],
						[0, 0, 0],
					),
				});
				oscillator.connectAudio(context.destination);
				oscillator.start(0);

				const actual = await context.startRendering();

				const expected = await loadWaveFile(
					context,
					"../../test/fixtures/custom-r0.5:0.1:0.9-i0:0:0-t200ms.wav",
				);

				assert.isAtMost(
					stats.rmse(
						anlalyse.spectrum(actual, { fftSize: 1024, hopSize: 64 }).flat(2),
						anlalyse.spectrum(expected, { fftSize: 1024, hopSize: 64 }).flat(2),
					),
					SPECTRUM_TOLERANCE,
				);
				assert.isAtMost(
					stats.rmse(
						anlalyse.signal(actual).flat(),
						anlalyse.signal(expected).flat(),
					),
					SIGNAL_TOLERANCE,
				);
			},
		);
	});

	test("can be restarted", () => {
		return withOfflineContext(
			{ length: 0.2, sampleRate: 44100 },
			async (context) => {
				const oscillator = OscillatorNode.create(context, {
					type: "sine",
					frequency: 440,
				});
				oscillator.connectAudio(context.destination);
				oscillator.start(0);
				oscillator.stop(0.05);
				oscillator.start(0.1);
				oscillator.stop(0.15);

				const actual = await context.startRendering();

				const expected = await loadWaveFile(
					context,
					"../../test/fixtures/sine-f440-t0:50ms-t:100:150ms.wav",
				);

				assert.isAtMost(
					stats.rmse(
						anlalyse.spectrum(actual, { fftSize: 1024, hopSize: 64 }).flat(2),
						anlalyse.spectrum(expected, { fftSize: 1024, hopSize: 64 }).flat(2),
					),
					SPECTRUM_TOLERANCE,
				);
				assert.isAtMost(
					stats.rmse(
						anlalyse.signal(actual).flat(),
						anlalyse.signal(expected).flat(),
					),
					SIGNAL_TOLERANCE,
				);
			},
		);
	});
});
