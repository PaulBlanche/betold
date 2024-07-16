/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
export function range(value, min, max) {
	if (value < min || value > max) {
		throw RangeError(
			`Value must be within the interval [${min}, ${max}], got : ${value}`,
		);
	}
}

/**
 * @param {number} start
 * @param {number} end
 */
export function wellOrderedTime(start, end) {
	if (start > end) {
		throw RangeError(
			`Value ${start} should be lower than or equal to ${end} are not well ordered.`,
		);
	}
}
