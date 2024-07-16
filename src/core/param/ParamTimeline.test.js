import { assert } from "../../../test/assert.js";
import * as interpolate from "../../utils/interpolate.js";
import { ParamTimeline } from "./ParamTimeline.js";

suite("ParamTimeline.getValueAtTime", async () => {
	test("with no events", () => {
		const timeline = ParamTimeline.create({ defaultValue: 3 });

		assert.strictEqual(timeline.getValueAtTime(0), 3);
		assert.strictEqual(timeline.getValueAtTime(5), 3);
		assert.strictEqual(timeline.getValueAtTime(17), 3);
	});

	test("with one setValueEvent", () => {
		const timeline = ParamTimeline.create({ defaultValue: 3 });
		timeline.add({ time: 2, type: "setValueAtTime", value: 1 });

		assert.strictEqual(timeline.getValueAtTime(0), 3);
		assert.strictEqual(timeline.getValueAtTime(1.999), 3);
		assert.strictEqual(timeline.getValueAtTime(2), 1);
		assert.strictEqual(timeline.getValueAtTime(5), 1);
		assert.strictEqual(timeline.getValueAtTime(17), 1);
	});

	test("with one linear rampToValueAtTime", () => {
		const timeline = ParamTimeline.create({ defaultValue: 0 });
		timeline.add({
			time: 2,
			type: "rampToValueAtTime",
			currentTime: 1,
			value: 1,
		});

		assert.strictEqual(timeline.getValueAtTime(0), 0);
		assert.strictEqual(timeline.getValueAtTime(0.5), 0);
		assert.strictEqual(
			timeline.getValueAtTime(1),
			interpolate.linearValue({ time: 1, value: 0 }, { time: 2, value: 1 }, 1),
		);
		assert.strictEqual(
			timeline.getValueAtTime(1.5),
			interpolate.linearValue(
				{ time: 1, value: 0 },
				{ time: 2, value: 1 },
				1.5,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(2),
			interpolate.linearValue({ time: 1, value: 0 }, { time: 2, value: 1 }, 2),
		);
		assert.strictEqual(timeline.getValueAtTime(5), 1);
		assert.strictEqual(timeline.getValueAtTime(17), 1);
	});

	test("with one exponential rampToValueAtTime", () => {
		const timeline = ParamTimeline.create({ defaultValue: 0.2 });
		timeline.add({
			time: 2,
			type: "rampToValueAtTime",
			currentTime: 1,
			exponential: true,
			value: 1,
		});

		assert.strictEqual(timeline.getValueAtTime(0), 0.2);
		assert.strictEqual(timeline.getValueAtTime(0.5), 0.2);
		assert.strictEqual(
			timeline.getValueAtTime(1),
			interpolate.exponentialValue(
				{ time: 1, value: 0.2 },
				{ time: 2, value: 1 },
				1,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(1.5),
			interpolate.exponentialValue(
				{ time: 1, value: 0.2 },
				{ time: 2, value: 1 },
				1.5,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(2),
			interpolate.exponentialValue(
				{ time: 1, value: 0.2 },
				{ time: 2, value: 1 },
				2,
			),
		);
		assert.strictEqual(timeline.getValueAtTime(5), 1);
		assert.strictEqual(timeline.getValueAtTime(17), 1);
	});

	test("with one setTargetAtTime", () => {
		const timeline = ParamTimeline.create({ defaultValue: 0 });
		timeline.add({
			time: 1,
			type: "setTargetAtTime",
			timeConstant: 2,
			value: 1,
		});

		assert.strictEqual(timeline.getValueAtTime(0), 0);
		assert.strictEqual(timeline.getValueAtTime(0.5), 0);
		assert.strictEqual(
			timeline.getValueAtTime(1),
			interpolate.exponentialTarget(
				{ time: 1, value: 0 },
				{ target: 1, timeConstant: 2 },
				1,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(5),
			interpolate.exponentialTarget(
				{ time: 1, value: 0 },
				{ target: 1, timeConstant: 2 },
				5,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(17),
			interpolate.exponentialTarget(
				{ time: 1, value: 0 },
				{ target: 1, timeConstant: 2 },
				17,
			),
		);
	});

	test("with setValueAtTime and rampToValueAtTime", () => {
		const timeline = ParamTimeline.create({ defaultValue: 0 });
		timeline.add({ time: 0, type: "setValueAtTime", value: 2 });
		timeline.add({
			time: 1,
			type: "rampToValueAtTime",
			currentTime: 0,
			value: 1,
		});

		assert.strictEqual(timeline.getValueAtTime(0), 2);
		assert.strictEqual(timeline.getValueAtTime(0.25), 1.75);
		assert.strictEqual(timeline.getValueAtTime(0.5), 1.5);
		assert.strictEqual(timeline.getValueAtTime(0.75), 1.25);
		assert.strictEqual(timeline.getValueAtTime(1), 1);
		assert.strictEqual(timeline.getValueAtTime(5), 1);
		assert.strictEqual(timeline.getValueAtTime(17), 1);
	});

	test("with setValueAtTime and setTargetAtTime", () => {
		const timeline = ParamTimeline.create({ defaultValue: 0 });
		timeline.add({ time: 0, type: "setValueAtTime", value: 2 });
		timeline.add({
			time: 1,
			type: "setTargetAtTime",
			timeConstant: 2,
			value: 1,
		});

		assert.strictEqual(timeline.getValueAtTime(0), 2);
		assert.strictEqual(timeline.getValueAtTime(0.25), 2);
		assert.strictEqual(timeline.getValueAtTime(0.5), 2);
		assert.strictEqual(timeline.getValueAtTime(0.75), 2);
		assert.strictEqual(
			timeline.getValueAtTime(1),
			interpolate.exponentialTarget(
				{ time: 1, value: 2 },
				{ target: 1, timeConstant: 2 },
				1,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(5),
			interpolate.exponentialTarget(
				{ time: 1, value: 2 },
				{ target: 1, timeConstant: 2 },
				5,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(17),
			interpolate.exponentialTarget(
				{ time: 1, value: 2 },
				{ target: 1, timeConstant: 2 },
				17,
			),
		);
	});

	test("with setValueAtTime and setValueAtTime", () => {
		const timeline = ParamTimeline.create({ defaultValue: 0 });
		timeline.add({ time: 0, type: "setValueAtTime", value: 2 });
		timeline.add({ time: 1, type: "setValueAtTime", value: 1 });

		assert.strictEqual(timeline.getValueAtTime(0), 2);
		assert.strictEqual(timeline.getValueAtTime(0.25), 2);
		assert.strictEqual(timeline.getValueAtTime(0.5), 2);
		assert.strictEqual(timeline.getValueAtTime(0.75), 2);
		assert.strictEqual(timeline.getValueAtTime(1), 1);
		assert.strictEqual(timeline.getValueAtTime(5), 1);
		assert.strictEqual(timeline.getValueAtTime(17), 1);
	});

	test("with rampToValueAtTime and setValueAtTime before ramp end", () => {
		const timeline = ParamTimeline.create({ defaultValue: 0 });
		timeline.add({
			time: 2,
			type: "rampToValueAtTime",
			currentTime: 0,
			value: 2,
		});
		timeline.add({ time: 1, type: "setValueAtTime", value: 1 });

		assert.strictEqual(timeline.getValueAtTime(0), 0);
		assert.strictEqual(timeline.getValueAtTime(0.5), 0);
		assert.strictEqual(timeline.getValueAtTime(1), 1);
		assert.strictEqual(timeline.getValueAtTime(1.5), 1.5);
		assert.strictEqual(timeline.getValueAtTime(2), 2);
		assert.strictEqual(timeline.getValueAtTime(5), 2);
		assert.strictEqual(timeline.getValueAtTime(17), 2);
	});

	test("with rampToValueAtTime and setTargetAtTime before ramp end", () => {
		const timeline = ParamTimeline.create({ defaultValue: 0 });
		timeline.add({
			time: 4,
			type: "rampToValueAtTime",
			currentTime: 0,
			value: 1,
		});
		timeline.add({
			time: 1,
			type: "setTargetAtTime",
			timeConstant: 2,
			value: 1,
		});

		assert.strictEqual(timeline.getValueAtTime(0), 0);
		assert.strictEqual(timeline.getValueAtTime(0.5), 0);
		assert.strictEqual(
			timeline.getValueAtTime(1),
			interpolate.linearValue({ time: 1, value: 0 }, { time: 4, value: 1 }, 1),
		);
		assert.strictEqual(
			timeline.getValueAtTime(1.25),
			interpolate.linearValue(
				{ time: 1, value: 0 },
				{ time: 4, value: 1 },
				1.25,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(1.75),
			interpolate.linearValue(
				{ time: 1, value: 0 },
				{ time: 4, value: 1 },
				1.75,
			),
		);
		assert.strictEqual(timeline.getValueAtTime(5), 1);
		assert.strictEqual(timeline.getValueAtTime(17), 1);
	});

	test("with rampToValueAtTime and rampToValueAtTime before ramp end", () => {
		const timeline = ParamTimeline.create({ defaultValue: 0 });
		timeline.add({
			time: 4,
			type: "rampToValueAtTime",
			currentTime: 0,
			value: 5,
		});
		timeline.add({
			time: 2,
			type: "rampToValueAtTime",
			currentTime: 1,
			value: 1,
		});

		assert.strictEqual(timeline.getValueAtTime(0), 0);
		assert.strictEqual(
			timeline.getValueAtTime(1),
			interpolate.linearValue({ time: 1, value: 0 }, { time: 2, value: 1 }, 1),
		);
		assert.strictEqual(
			timeline.getValueAtTime(2),
			interpolate.linearValue({ time: 1, value: 0 }, { time: 2, value: 1 }, 2),
		);
		assert.strictEqual(
			timeline.getValueAtTime(3),
			interpolate.linearValue({ time: 2, value: 1 }, { time: 4, value: 5 }, 3),
		);
		assert.strictEqual(
			timeline.getValueAtTime(4),
			interpolate.linearValue({ time: 2, value: 1 }, { time: 4, value: 5 }, 4),
		);
		assert.strictEqual(timeline.getValueAtTime(5), 5);
		assert.strictEqual(timeline.getValueAtTime(17), 5);
	});

	test("with setTargetAtTime and setValueAtTime before target end", () => {
		const timeline = ParamTimeline.create({ defaultValue: 0 });
		timeline.add({
			time: 1,
			type: "setTargetAtTime",
			timeConstant: 2,
			value: 5,
		});
		timeline.add({
			time: 2,
			type: "setValueAtTime",
			value: 1,
		});

		assert.strictEqual(timeline.getValueAtTime(0), 0);
		assert.strictEqual(
			timeline.getValueAtTime(1),
			interpolate.exponentialTarget(
				{ time: 1, value: 0 },
				{ target: 5, timeConstant: 2 },
				1,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(1.5),
			interpolate.exponentialTarget(
				{ time: 1, value: 0 },
				{ target: 5, timeConstant: 2 },
				1.5,
			),
		);
		assert.strictEqual(timeline.getValueAtTime(2), 1);
		assert.strictEqual(timeline.getValueAtTime(5), 1);
		assert.strictEqual(timeline.getValueAtTime(17), 1);
	});

	test("with setTargetAtTime and setTargetAtTime before target end", () => {
		const timeline = ParamTimeline.create({ defaultValue: 0 });
		timeline.add({
			time: 1,
			type: "setTargetAtTime",
			timeConstant: 2,
			value: 5,
		});
		timeline.add({
			time: 2,
			type: "setTargetAtTime",
			timeConstant: 2,
			value: 10,
		});

		assert.strictEqual(timeline.getValueAtTime(0), 0);
		assert.strictEqual(
			timeline.getValueAtTime(1),
			interpolate.exponentialTarget(
				{ time: 1, value: 0 },
				{ target: 5, timeConstant: 2 },
				1,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(1.5),
			interpolate.exponentialTarget(
				{ time: 1, value: 0 },
				{ target: 5, timeConstant: 2 },
				1.5,
			),
		);
		const finalFirstTargetValue = interpolate.exponentialTarget(
			{ time: 1, value: 0 },
			{ target: 5, timeConstant: 2 },
			2,
		);
		assert.strictEqual(
			timeline.getValueAtTime(2),
			interpolate.exponentialTarget(
				{ time: 2, value: finalFirstTargetValue },
				{ target: 10, timeConstant: 2 },
				2,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(5),
			interpolate.exponentialTarget(
				{ time: 2, value: finalFirstTargetValue },
				{ target: 10, timeConstant: 2 },
				5,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(17),
			interpolate.exponentialTarget(
				{ time: 2, value: finalFirstTargetValue },
				{ target: 10, timeConstant: 2 },
				17,
			),
		);
	});

	test("with setTargetAtTime and rampToValueAtTime before target end", () => {
		const timeline = ParamTimeline.create({ defaultValue: 0 });
		timeline.add({
			time: 1,
			type: "setTargetAtTime",
			timeConstant: 2,
			value: 5,
		});
		timeline.add({
			time: 3,
			type: "rampToValueAtTime",
			currentTime: 2,
			value: 10,
		});

		assert.strictEqual(timeline.getValueAtTime(0), 0);
		assert.strictEqual(
			timeline.getValueAtTime(1),
			interpolate.exponentialTarget(
				{ time: 1, value: 0 },
				{ target: 5, timeConstant: 2 },
				1,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(1.5),
			interpolate.exponentialTarget(
				{ time: 1, value: 0 },
				{ target: 5, timeConstant: 2 },
				1.5,
			),
		);
		const finalFirstTargetValue = interpolate.exponentialTarget(
			{ time: 1, value: 0 },
			{ target: 5, timeConstant: 2 },
			2,
		);
		assert.strictEqual(
			timeline.getValueAtTime(2),
			interpolate.linearValue(
				{ time: 2, value: finalFirstTargetValue },
				{ time: 3, value: 10 },
				2,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(2.5),
			interpolate.linearValue(
				{ time: 2, value: finalFirstTargetValue },
				{ time: 3, value: 10 },
				2.5,
			),
		);
		assert.strictEqual(
			timeline.getValueAtTime(3),
			interpolate.linearValue(
				{ time: 2, value: finalFirstTargetValue },
				{ time: 3, value: 10 },
				3,
			),
		);
		assert.strictEqual(timeline.getValueAtTime(5), 10);
		assert.strictEqual(timeline.getValueAtTime(17), 10);
	});
});
