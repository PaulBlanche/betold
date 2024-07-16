import { assert } from "../../../test/assert.js";
import { withContext } from "../../../test/withContext.js";
import * as compare from "../../utils/compare.js";
import { OnlineContext } from "../OnlineContext.js";
import { BeatFrequencyParam } from "./BeatFrequencyParam.js";

suite("Transport.getBeatAtTime", () => {
	test("gives the expected beat given constant frequency", () => {
		return withContext({}, (context) => {
			return withWiredParam(async (beatFrequencyParam) => {
				beatFrequencyParam.setValueAtTime(1, 0);
				beatFrequencyParam.setValueAtTime(2, 1);

				for (let t = 0; t < 1; t += 0.1) {
					const actualBeat = beatFrequencyParam.getBeatAtTime(t);
					const expectedBeat = t; // frequency is 1
					assert.closeTo(actualBeat, expectedBeat, compare.EPSILON);
				}
				for (let t = 1; t < 2; t += 0.1) {
					const actualBeat = beatFrequencyParam.getBeatAtTime(t);
					const expectedBeat = (t - 1) * 2 + 1; // frequency is 2 from beat 1 at time 1
					assert.closeTo(actualBeat, expectedBeat, compare.EPSILON);
				}
			}, context);
		});
	});

	test("gives the expected beat given ramping frequency", () => {
		return withContext({}, (context) => {
			return withWiredParam(async (beatFrequencyParam) => {
				beatFrequencyParam.setValueAtTime(1, 0);
				beatFrequencyParam.setValueAtTime(1, 1);
				beatFrequencyParam.setRampTo(3, { endTime: 2 });

				for (let t = 0; t < 0.9; t += 0.1) {
					const actualBeat = beatFrequencyParam.getBeatAtTime(t);
					const expectedBeat = t; // frequency is 1
					assert.closeTo(actualBeat, expectedBeat, compare.EPSILON);
				}

				// during ramp, beat(t) goes from slope (frequency) of 1 ...
				const slopeAtRampStart =
					(beatFrequencyParam.getBeatAtTime(1.01) -
						beatFrequencyParam.getBeatAtTime(1)) /
					(1.01 - 1);

				assert.closeTo(slopeAtRampStart, 1, 0.01);

				// .. to slope (frequency) of 3
				const slopeAtRampEnd =
					(beatFrequencyParam.getBeatAtTime(1.99) -
						beatFrequencyParam.getBeatAtTime(2)) /
					(1.99 - 2);

				assert.closeTo(slopeAtRampEnd, 3, 0.01);

				// after ramp, keep the end frequency of 3
				for (let t = 2; t < 2.9; t += 0.1) {
					const actualBeat = beatFrequencyParam.getBeatAtTime(t);
					const expectedBeat = 3 + (t - 2) * 3; // ramp stopped at beat 3 at time 2 with frequency 3
					assert.closeTo(actualBeat, expectedBeat, compare.EPSILON);
				}
			}, context);
		});
	});
});

suite("Transport.getTimeAtBeat", () => {
	test("to be the reciprocal of getBeatAtTime", () => {
		return withContext({}, (context) => {
			return withWiredParam(async (beatFrequencyParam) => {
				beatFrequencyParam.setValueAtTime(1, 0);
				beatFrequencyParam.setValueAtTime(1, 1);
				beatFrequencyParam.setRampTo(3, { endTime: 2 });

				for (let t = 0; t < 2.9; t += 0.1) {
					const actualTime = beatFrequencyParam.getTimeAtBeat(
						beatFrequencyParam.getBeatAtTime(t),
					);
					assert.closeTo(actualTime, t, compare.EPSILON);
				}
			}, context);
		});
	});
});

/**
 * @param {OnlineContext} context
 * @param {(param: BeatFrequencyParam) => Promise<void>} callback
 */
async function withWiredParam(callback, context) {
	const source = context._audioContext.createConstantSource();
	source.connect(context.destination);
	source.start(0);

	const param = BeatFrequencyParam.create(context, {
		audioParam: source.offset,
	});

	await callback(param);
}
