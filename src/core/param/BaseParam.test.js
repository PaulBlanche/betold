import { assert } from "../../../test/assert.js";
import * as stats from "../../../test/utils/stats.js";
import { withContext } from "../../../test/withContext.js";
import * as interpolate from "../../utils/interpolate.js";
import { BaseContext } from "../BaseContext.js";
import { OnlineContext } from "../OnlineContext.js";
import { BaseParam } from "./BaseParam.js";

suite("BaseParam constructor", () => {
	test("have expected values given config", () => {
		return withContext({}, async (context) => {
			const param = BaseParam.create(context, {
				min: 0,
				max: 1,
				defaultValue: 0.5,
			});

			assert.strictEqual(param.defaultValue, 0.5);
			assert.strictEqual(param.min, 0);
			assert.strictEqual(param.max, 1);
			assert.strictEqual(param.value, 0.5);
		});
	});

	test("have some defaults", () => {
		return withContext({}, async (context) => {
			const source = context._audioContext.createConstantSource();
			source.connect(context.destination);
			source.start(0);

			const paramWithAudioParam = BaseParam.create(context, {
				audioParam: source.offset,
			});

			const paramWithoutAudioParam = BaseParam.create(context, {});

			assert.strictEqual(
				paramWithAudioParam.defaultValue,
				source.offset.defaultValue,
			);
			assert.strictEqual(paramWithAudioParam.min, source.offset.minValue);
			assert.strictEqual(paramWithAudioParam.max, source.offset.maxValue);

			assert.strictEqual(paramWithoutAudioParam.defaultValue, 0);
			assert.strictEqual(paramWithoutAudioParam.min, Number.NEGATIVE_INFINITY);
			assert.strictEqual(paramWithoutAudioParam.max, Number.POSITIVE_INFINITY);
		});
	});

	test("clamp defaultValue higher than max", () => {
		return withContext({}, async (context) => {
			const param = BaseParam.create(context, {
				max: 1,
				defaultValue: 2,
			});

			assert.strictEqual(param.defaultValue, 1);
		});
	});

	test("clamp defaultValue lower than min", () => {
		return withContext({}, async (context) => {
			const param = BaseParam.create(context, {
				min: 0,
				defaultValue: -1,
			});

			assert.strictEqual(param.defaultValue, 0);
		});
	});
});

suite("BaseParam.setValueAtTime", () => {
	test("should set the given value at the given time", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context }, async (param) => {
				param.setValueAtTime(0.2, 0.02);

				const { values, valuesAtTime, times } = await captureParam(
					context,
					param,
					0.04,
				);

				const expectedValues = [];
				for (const time of times) {
					expectedValues.push(time < 0.02 ? 1 : 0.2);
				}

				assertIsCorrelated(expectedValues, values, valuesAtTime, times);
			});
		});
	});

	test("should guard against out of range values", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context, min: 0, max: 1 }, async (param) => {
				assert.doesNotThrow(() => {
					param.setValueAtTime(0.2, 0);
				});
				assert.doesNotThrow(() => {
					param.setValueAtTime(0, 0);
				});
				assert.doesNotThrow(() => {
					param.setValueAtTime(1, 0);
				});
				assert.throws(() => {
					param.setValueAtTime(1.1, 1);
				});
				assert.throws(() => {
					param.setValueAtTime(-0.1, 1);
				});
			});
		});
	});
});

suite("BaseParam.setRampTo", () => {
	test("should linear ramp the param to the given value at the given time", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context }, async (param) => {
				param.setRampTo(0, { endTime: 0.1 });

				const { values, valuesAtTime, times } = await captureParam(
					context,
					param,
					0.2,
				);

				const expectedValues = [];
				for (const time of times) {
					if (time < 0.1) {
						expectedValues.push(
							interpolate.linearValue(
								{ time: 0, value: 1 },
								{ time: 0.1, value: 0 },
								time,
							),
						);
					} else {
						expectedValues.push(0);
					}
				}

				assert.isAtLeast(stats.linearCorrelation(expectedValues, values), 0.99);
				assert.isAtLeast(
					stats.linearCorrelation(expectedValues, valuesAtTime),
					0.99,
				);
			});
		});
	});

	test("should exponential ramp the param to the given value at the given time", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context }, async (param) => {
				param.setRampTo(0.001, { endTime: 0.1, exponential: true });

				const { values, valuesAtTime, times } = await captureParam(
					context,
					param,
					0.2,
				);

				const expectedValues = [];
				for (const time of times) {
					expectedValues.push(
						time < 0.1
							? interpolate.exponentialValue(
									{ time: 0, value: 1 },
									{ time: 0.1, value: 0.001 },
									time,
								)
							: 0,
					);
				}

				assert.isAtLeast(stats.linearCorrelation(expectedValues, values), 0.99);
				assert.isAtLeast(
					stats.linearCorrelation(expectedValues, valuesAtTime),
					0.99,
				);
			});
		});
	});

	test("should guard against out of range values", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context, min: 0, max: 1 }, async (param) => {
				assert.doesNotThrow(() => {
					param.setRampTo(0.2, { endTime: 0.2 });
				});
				assert.doesNotThrow(() => {
					param.setRampTo(0, { endTime: 0.2 });
				});
				assert.doesNotThrow(() => {
					param.setRampTo(1, { endTime: 0.2 });
				});
				assert.throws(() => {
					param.setRampTo(1.1, { endTime: 0.2 });
				});
				assert.throws(() => {
					param.setRampTo(-0.1, { endTime: 0.2 });
				});
			});
		});
	});
});

suite("BaseParam.setTargetAtTime", () => {
	test("should converge the param to the given value at the given time constant", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context }, async (param) => {
				param.setTargetAtTime(0.001, { endTime: 0.1, startTime: 0 });

				const { values, valuesAtTime, times } = await captureParam(
					context,
					param,
					0.2,
				);

				const expectedValues = [];
				for (const time of times) {
					expectedValues.push(
						interpolate.target(
							{ time: 0, value: 1 },
							{ time: 0.1, value: 0.001 },
							time,
						),
					);
				}

				assert.isAtLeast(stats.linearCorrelation(expectedValues, values), 0.99);
				assert.isAtLeast(
					stats.linearCorrelation(expectedValues, valuesAtTime),
					0.99,
				);
			});
		});
	});

	test("should guard against out of range values", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context, min: 0, max: 1 }, async (param) => {
				assert.doesNotThrow(() => {
					param.setTargetAtTime(0.2, { startTime: 0, endTime: 0.2 });
				});
				assert.doesNotThrow(() => {
					param.setTargetAtTime(0.001, { startTime: 0, endTime: 0.2 });
				});
				assert.doesNotThrow(() => {
					param.setTargetAtTime(1, { startTime: 0, endTime: 0.2 });
				});
				assert.throws(() => {
					param.setTargetAtTime(1.1, { startTime: 0, endTime: 0.2 });
				});
				assert.throws(() => {
					param.setTargetAtTime(-0.1, { startTime: 0, endTime: 0.2 });
				});
			});
		});
	});
});

suite("BaseParam.setValueCurveAtTime", () => {
	test("should ramp to the list of values in the curve", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context }, async (param) => {
				param.setValueCurveAtTime([0, 1, 0], 0.0001, 0.1);

				const { values, valuesAtTime, times } = await captureParam(
					context,
					param,
					0.2,
				);

				const expectedValues = [];
				for (const time of times) {
					if (time <= 0.0001) {
						expectedValues.push(1);
					} else if (time <= 0.05) {
						expectedValues.push(
							interpolate.linearValue(
								{ time: 0, value: 0 },
								{ time: 0.05, value: 1 },
								time,
							),
						);
					} else if (time <= 0.1) {
						expectedValues.push(
							interpolate.linearValue(
								{ time: 0.05, value: 1 },
								{ time: 0.1, value: 0 },
								time,
							),
						);
					} else {
						expectedValues.push(0);
					}
				}

				assert.isAtLeast(stats.linearCorrelation(expectedValues, values), 0.99);
				assert.isAtLeast(
					stats.linearCorrelation(expectedValues, valuesAtTime),
					0.99,
				);
			});
		});
	});

	test("should guard against out of range values", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context, min: 0, max: 1 }, async (param) => {
				assert.doesNotThrow(() => {
					param.setValueCurveAtTime([0.1, 0.9], 0, 0.2);
				});
				assert.doesNotThrow(() => {
					param.setValueCurveAtTime([0, 1], 0, 0.2);
				});
				assert.throws(() => {
					param.setValueCurveAtTime([0, 1.1], 0, 0.2);
				});
				assert.throws(() => {
					param.setValueCurveAtTime([-0.1, 1], 0, 0.2);
				});
			});
		});
	});
});

suite("BaseParam.cancelScheduledValuesBetween", () => {
	test("setValueAtTime are canceled", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context }, async (param) => {
				param.setValueAtTime(0.2, 0.04);
				param.setValueAtTime(0.4, 0.08);
				param.setValueAtTime(0.6, 0.12);
				param.setValueAtTime(0.8, 0.16);
				param.cancelScheduledValuesBetween(0.08, 1);

				const { values, valuesAtTime, times } = await captureParam(
					context,
					param,
					0.2,
				);

				const expectedValues = [];
				for (const time of times) {
					expectedValues.push(time < 0.04 ? 1 : 0.2);
				}

				assertIsCorrelated(expectedValues, values, valuesAtTime, times);
			});
		});
	});

	test("setRampTo are canceled entierly and partway", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context }, async (param) => {
				param.setRampTo(0.4, { endTime: 0.16 });
				param.setRampTo(0.8, { endTime: 0.3 });
				// cancel in the middle of first ramp
				param.cancelScheduledValuesBetween(0.08, 1);

				const { values, valuesAtTime, times } = await captureParam(
					context,
					param,
					0.2,
				);

				const expectedValues = [];
				for (const time of times) {
					if (time < 0.08) {
						expectedValues.push(
							interpolate.linearValue(
								{ time: 0, value: 1 },
								{ time: 0.16, value: 0.4 },
								time,
							),
						);
					} else {
						expectedValues.push(0.7);
					}
				}

				assertIsCorrelated(expectedValues, values, valuesAtTime, times);
			});
		});
	});

	test("setTargetAtTime are canceled", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context }, async (param) => {
				param.setTargetAtTime(0.4, { startTime: 0, endTime: 0.1 });
				param.setTargetAtTime(0.8, { startTime: 0.1, endTime: 0.2 });
				param.cancelScheduledValuesBetween(0.05, 1);

				const { values, valuesAtTime, times } = await captureParam(
					context,
					param,
					0.2,
				);

				const holdValue = interpolate.exponentialTarget(
					{ time: 0, value: 1 },
					{ timeConstant: 0.017988763830208514, target: 0.4 },
					0.05,
				);

				const expectedValues = [];
				for (const time of times) {
					if (time < 0.05) {
						expectedValues.push(
							interpolate.exponentialTarget(
								{ time: 0, value: 1 },
								{ timeConstant: 0.017988763830208514, target: 0.4 },
								time,
							),
						);
					} else {
						expectedValues.push(holdValue);
					}
				}

				assertIsCorrelated(expectedValues, values, valuesAtTime, times);
			});
		});
	});

	test("overlapping transactions are canceled", () => {
		return withContext({}, (context) => {
			return withWiredParam({ context }, async (param) => {
				let t = param.begin();
				param.setValueAtTime(1, 0.02);
				param.setValueAtTime(1.5, 0.04);
				param.end(t);

				t = param.begin();
				param.setValueAtTime(2, 0.06);
				param.setValueAtTime(2.5, 0.08);
				param.end(t);

				t = param.begin();
				param.setValueAtTime(3, 0.1);
				param.setValueAtTime(3.5, 0.12);
				param.end(t);

				t = param.begin();
				param.setValueAtTime(4, 0.14);
				param.setValueAtTime(4.5, 0.16);
				param.end(t);

				t = param.begin();
				param.setValueAtTime(5, 0.18);
				param.setValueAtTime(5.5, 0.2);
				param.end(t);

				param.cancelScheduledValuesBetween(0.07, 0.15);

				assert.strictEqual(param.getValueAtTime(0.02), 1);
				assert.strictEqual(param.getValueAtTime(0.03), 1);
				assert.strictEqual(param.getValueAtTime(0.04), 1.5);
				assert.strictEqual(param.getValueAtTime(0.05), 1.5);
				assert.strictEqual(param.getValueAtTime(0.06), 1.5);
				assert.strictEqual(param.getValueAtTime(0.07), 1.5);
				assert.strictEqual(param.getValueAtTime(0.08), 1.5);
				assert.strictEqual(param.getValueAtTime(0.09), 1.5);
				assert.strictEqual(param.getValueAtTime(0.1), 1.5);
				assert.strictEqual(param.getValueAtTime(0.11), 1.5);
				assert.strictEqual(param.getValueAtTime(0.12), 1.5);
				assert.strictEqual(param.getValueAtTime(0.13), 1.5);
				assert.strictEqual(param.getValueAtTime(0.14), 1.5);
				assert.strictEqual(param.getValueAtTime(0.15), 1.5);
				assert.strictEqual(param.getValueAtTime(0.16), 1.5);
				assert.strictEqual(param.getValueAtTime(0.17), 1.5);
				assert.strictEqual(param.getValueAtTime(0.18), 5);
				assert.strictEqual(param.getValueAtTime(0.19), 5);
				assert.strictEqual(param.getValueAtTime(0.2), 5.5);
			});
		});
	});

	test("overlapping started transactions are partially canceled", () => {
		let currentTime = 0;
		const param = BaseParam.create(
			{
				get currentTime() {
					return currentTime;
				},
				sampleRate: 44100,
				register: () => {},
				deregister: () => {},
			},
			{},
		);

		let t = param.begin();
		param.setValueAtTime(1, 0.02);
		param.setValueAtTime(1.5, 0.04);
		param.end(t);

		t = param.begin();
		param.setValueAtTime(2, 0.06);
		param.setValueAtTime(2.5, 0.08);
		param.end(t);

		t = param.begin();
		param.setValueAtTime(3, 0.1);
		param.setValueAtTime(3.5, 0.12);
		param.end(t);

		t = param.begin();
		param.setValueAtTime(4, 0.14);
		param.setValueAtTime(4.5, 0.16);
		param.end(t);

		t = param.begin();
		param.setValueAtTime(5, 0.18);
		param.setValueAtTime(5.5, 0.2);
		param.end(t);

		currentTime = 0.07;
		param.cancelScheduledValuesBetween(0.07, 0.15);

		assert.strictEqual(param.getValueAtTime(0.02), 1);
		assert.strictEqual(param.getValueAtTime(0.03), 1);
		assert.strictEqual(param.getValueAtTime(0.04), 1.5);
		assert.strictEqual(param.getValueAtTime(0.05), 1.5);
		assert.strictEqual(param.getValueAtTime(0.06), 2);
		assert.strictEqual(param.getValueAtTime(0.07), 2);
		assert.strictEqual(param.getValueAtTime(0.08), 2);
		assert.strictEqual(param.getValueAtTime(0.09), 2);
		assert.strictEqual(param.getValueAtTime(0.1), 2);
		assert.strictEqual(param.getValueAtTime(0.11), 2);
		assert.strictEqual(param.getValueAtTime(0.12), 2);
		assert.strictEqual(param.getValueAtTime(0.13), 2);
		assert.strictEqual(param.getValueAtTime(0.14), 2);
		assert.strictEqual(param.getValueAtTime(0.15), 2);
		assert.strictEqual(param.getValueAtTime(0.16), 2);
		assert.strictEqual(param.getValueAtTime(0.17), 2);
		assert.strictEqual(param.getValueAtTime(0.18), 5);
		assert.strictEqual(param.getValueAtTime(0.19), 5);
		assert.strictEqual(param.getValueAtTime(0.2), 5.5);
	});
});

/**
 *
 * @param {AnyNumberArray} expected
 * @param {AnyNumberArray} values
 * @param {AnyNumberArray} valuesAtTime
 * @param {AnyNumberArray} times
 */
function assertIsCorrelated(expected, values, valuesAtTime, times) {
	try {
		assert.isAtLeast(stats.linearCorrelation(expected, values), 0.999);
	} catch (e) {
		console.log("times,expected,values");
		for (let i = 0; i < times.length; i++) {
			console.log(
				`${times[i].toFixed(6)},${expected[i].toFixed(6)},${values[i].toFixed(
					6,
				)}`,
			);
		}
		throw e;
	}

	try {
		assert.isAtLeast(stats.linearCorrelation(expected, valuesAtTime), 0.999);
	} catch (e) {
		console.log("times,expected,valuesAtTime");
		for (let i = 0; i < times.length; i++) {
			console.log(
				`${times[i].toFixed(6)},${expected[i].toFixed(6)},${valuesAtTime[
					i
				].toFixed(6)}`,
			);
		}
		throw e;
	}
}

/**
 *
 * @param {OnlineContext} context
 * @param {BaseParam} param
 * @param {number} timeout
 * @returns {Promise<{ values: number[], valuesAtTime: number[], times: number[]}>}
 */
async function captureParam(context, param, timeout) {
	return new Promise((res) => {
		/** @type {number[]} */
		const values = [param.value];
		/** @type {number[]} */
		const valuesAtTime = [param.getValueAtTime(context.currentTime)];
		/** @type {number[]} */
		const times = [context.currentTime];

		const handle = setInterval(() => {
			values.push(param.value);
			valuesAtTime.push(param.getValueAtTime(context.currentTime));
			times.push(context.currentTime);

			if (context.currentTime > timeout) {
				clearInterval(handle);
				res({ values, valuesAtTime, times });
			}
		}, 10);
	});
}

/**
 * @param {Omit<import("./BaseParam.js").BaseParamConfig, 'audioParam'> & { context: BaseContext}} config
 * @param {(context: BaseParam) => Promise<void>} callback
 */
async function withWiredParam(config, callback) {
	const source = config.context._audioContext.createConstantSource();
	source.connect(config.context.destination);
	source.start(0);

	const { context, ...paramConfig } = config;

	const param = BaseParam.create(context, {
		...paramConfig,
		audioParam: source.offset,
	});

	await callback(param);
}
