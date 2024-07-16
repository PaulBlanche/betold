import { assert } from "../../test/assert.js";
import { binarySearch } from "./binarySearch.js";

suite("binarySearch", () => {
	test("with one item array", () => {
		const events = [{ time: 1 }];

		assert.strictEqual(
			binarySearch(events, { property: "time", value: 1, type: "last-before" }),
			0,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 1,
				type: "last-before",
				strict: true,
			}),
			-1,
		);
		assert.strictEqual(
			binarySearch(events, { property: "time", value: 1, type: "first-after" }),
			0,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 1,
				type: "first-after",
				strict: true,
			}),
			-1,
		);
	});

	test("time matching first in two items array", () => {
		const events = [{ time: 1 }, { time: 3 }];

		assert.strictEqual(
			binarySearch(events, { property: "time", value: 1, type: "last-before" }),
			0,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 1,
				type: "last-before",
				strict: true,
			}),
			-1,
		);
		assert.strictEqual(
			binarySearch(events, { property: "time", value: 1, type: "first-after" }),
			0,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 1,
				type: "first-after",
				strict: true,
			}),
			1,
		);
	});

	test("time matching last in two items array", () => {
		const events = [{ time: 1 }, { time: 3 }];

		assert.strictEqual(
			binarySearch(events, { property: "time", value: 3, type: "last-before" }),
			1,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 3,
				type: "last-before",
				strict: true,
			}),
			0,
		);
		assert.strictEqual(
			binarySearch(events, { property: "time", value: 3, type: "first-after" }),
			1,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 3,
				type: "first-after",
				strict: true,
			}),
			-1,
		);
	});

	test("time between items in two items array", () => {
		const events = [{ time: 1 }, { time: 3 }];

		assert.strictEqual(
			binarySearch(events, { property: "time", value: 2, type: "last-before" }),
			0,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 2,
				type: "last-before",
				strict: true,
			}),
			0,
		);
		assert.strictEqual(
			binarySearch(events, { property: "time", value: 2, type: "first-after" }),
			1,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 2,
				type: "first-after",
				strict: true,
			}),
			1,
		);
	});

	test("time before first in two items array", () => {
		const events = [{ time: 1 }, { time: 3 }];

		assert.strictEqual(
			binarySearch(events, { property: "time", value: 0, type: "last-before" }),
			-1,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 0,
				type: "last-before",
				strict: true,
			}),
			-1,
		);
		assert.strictEqual(
			binarySearch(events, { property: "time", value: 0, type: "first-after" }),
			0,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 0,
				type: "first-after",
				strict: true,
			}),
			0,
		);
	});

	test("time after last in two items array", () => {
		const events = [{ time: 1 }, { time: 3 }];

		assert.strictEqual(
			binarySearch(events, { property: "time", value: 4, type: "last-before" }),
			1,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 4,
				type: "last-before",
				strict: true,
			}),
			1,
		);
		assert.strictEqual(
			binarySearch(events, { property: "time", value: 4, type: "first-after" }),
			-1,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 4,
				type: "first-after",
				strict: true,
			}),
			-1,
		);
	});

	test("repeating item amongst others", () => {
		const events = [
			{ time: 1 },
			{ time: 2 },
			{ time: 2 },
			{ time: 2 },
			{ time: 3 },
		];

		assert.strictEqual(
			binarySearch(events, { property: "time", value: 2, type: "last-before" }),
			3,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 2,
				type: "last-before",
				strict: true,
			}),
			0,
		);
		assert.strictEqual(
			binarySearch(events, { property: "time", value: 2, type: "first-after" }),
			1,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 2,
				type: "first-after",
				strict: true,
			}),
			4,
		);
	});

	test("only repeating items", () => {
		const events = [{ time: 2 }, { time: 2 }, { time: 2 }];

		assert.strictEqual(
			binarySearch(events, { property: "time", value: 2, type: "last-before" }),
			2,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 2,
				type: "last-before",
				strict: true,
			}),
			-1,
		);
		assert.strictEqual(
			binarySearch(events, { property: "time", value: 2, type: "first-after" }),
			0,
		);
		assert.strictEqual(
			binarySearch(events, {
				property: "time",
				value: 2,
				type: "first-after",
				strict: true,
			}),
			-1,
		);
	});

	test("find first element (lower branch of binary search)", () => {
		const events = [
			{ time: 1 },
			{ time: 2 },
			{ time: 2 },
			{ time: 2 },
			{ time: 2 },
			{ time: 2 },
			{ time: 2 },
		];

		assert.strictEqual(
			binarySearch(events, { property: "time", value: 1, type: "last-before" }),
			0,
		);
	});

	test("find last element (higher branch of binary search)", () => {
		const events = [
			{ time: 2 },
			{ time: 2 },
			{ time: 2 },
			{ time: 2 },
			{ time: 2 },
			{ time: 2 },
			{ time: 3 },
		];

		assert.strictEqual(
			binarySearch(events, { property: "time", value: 3, type: "last-before" }),
			6,
		);
	});
});
