export const EPSILON = 1e-6;

/**
 *
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
export function EQ(a, b) {
	return Math.abs(a - b) < EPSILON;
}

/**
 *
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
export function LT(a, b) {
	return a + EPSILON < b;
}

/**
 *
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
export function GT(a, b) {
	return a > b + EPSILON;
}

/**
 *
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
export function LTE(a, b) {
	return LT(a, b) || EQ(a, b);
}

/**
 *
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
export function GTE(a, b) {
	return GT(a, b) || EQ(a, b);
}
