import * as compare from "./compare.js";

/** @type {import("./binarySearch.js").binarySearch} */
export function binarySearch(array, { value, type, strict, property }) {
	let from = 0;
	let to = array.length;

	if (array.length > 0) {
		if (compare.LT(value, array[0][property]) && type === "first-after") {
			return 0;
		}
		if (
			compare.GT(value, array[array.length - 1][property]) &&
			type === "last-before"
		) {
			return array.length - 1;
		}
	}

	while (from < to) {
		let pivotIndex = Math.floor(from + (to - from) / 2);
		const pivotEvent = array[pivotIndex];
		const pivotNextEvent = array[pivotIndex + 1];
		if (compare.EQ(pivotEvent[property], value)) {
			if (
				(type === "last-before" && !strict) ||
				(type === "first-after" && strict)
			) {
				for (let i = pivotIndex; i < array.length; i++) {
					if (compare.EQ(array[i][property], value)) {
						pivotIndex = i;
					} else {
						break;
					}
				}

				if (strict) {
					pivotIndex += 1;
					if (pivotIndex >= array.length) {
						return -1;
					}
				}
			}

			if (
				(type === "last-before" && strict) ||
				(type === "first-after" && !strict)
			) {
				for (let i = pivotIndex; i >= 0; i--) {
					if (compare.EQ(array[i][property], value)) {
						pivotIndex = i;
					} else {
						break;
					}
				}

				if (strict) {
					pivotIndex -= 1;
				}
			}

			return pivotIndex;
		}

		if (
			compare.LT(pivotEvent[property], value) &&
			compare.GT(pivotNextEvent?.[property] ?? Number.POSITIVE_INFINITY, value)
		) {
			if (type === "last-before") {
				return pivotIndex;
			}
			if (type === "first-after") {
				if (pivotIndex + 1 >= array.length) {
					return -1;
				}
				return pivotIndex + 1;
			}
		}

		if (compare.GT(pivotEvent[property], value)) {
			to = pivotIndex;
		} else {
			from = pivotIndex + 1;
		}
	}

	return -1;
}
