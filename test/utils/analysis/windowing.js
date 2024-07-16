// lifted from https://github.com/richardeoin/nodejs-fft-windowing/blob/master/windowing.js and adapted to ESM

/** @typedef {number[]|Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} WindowableArray */

/**
 * @param {WindowableArray} array
 * @returns
 */
export function hann(array) {
	return window(array, hann_window);
}

/**
 * @param {WindowableArray} array
 * @returns
 */
export function hamming(array) {
	return window(array, hamming_window);
}

/**
 * @param {WindowableArray} array
 * @returns
 */
export function cosine(array) {
	return window(array, cosine_window);
}

/**
 * @param {WindowableArray} array
 * @returns
 */
export function lanczos(array) {
	return window(array, lanczos_window);
}

/**
 * @param {WindowableArray} array
 * @param {number} alpha
 * @returns
 */
export function gaussian(array, alpha) {
	return window(array, gaussian_window, alpha);
}

/**
 * @param {WindowableArray} array
 * @param {number} alpha
 * @returns
 */
export function tukey(array, alpha) {
	return window(array, tukey_window, alpha);
}

/**
 * @param {WindowableArray} array
 * @param {number} alpha
 * @returns
 */
export function blackman(array, alpha) {
	return window(array, blackman_window, alpha);
}

/**
 * @param {WindowableArray} array
 * @returns
 */
export function exact_blackman(array) {
	return window(array, exact_blackman_window);
}

/**
 * @param {WindowableArray} array
 * @param {number} alpha
 * @returns
 */
export function kaiser(array, alpha) {
	return window(array, kaiser_window, alpha);
}

/**
 * @param {WindowableArray} array
 * @returns
 */
export function nuttall(array) {
	return window(array, nuttall_window);
}

/**
 * @param {WindowableArray} array
 * @returns
 */
export function blackman_harris(array) {
	return window(array, blackman_harris_window);
}

/**
 * @param {WindowableArray} array
 * @returns
 */
export function blackman_nuttall(array) {
	return window(array, blackman_nuttall_window);
}

/**
 * @param {WindowableArray} array
 * @returns
 */
export function flat_top(array) {
	return window(array, flat_top_window);
}

/**
 * @param {number} n
 * @param {number} points
 */
function hann_window(n, points) {
	return 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (points - 1));
}

/**
 * @param {number} n
 * @param {number} points
 */
function hamming_window(n, points) {
	return 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (points - 1));
}

/**
 * @param {number} n
 * @param {number} points
 */
function cosine_window(n, points) {
	return Math.sin((Math.PI * n) / (points - 1));
}

/**
 * @param {number} n
 * @param {number} points
 */
function lanczos_window(n, points) {
	return sinc((2 * n) / (points - 1) - 1);
}

/**
 * @param {number} n
 * @param {number} points
 */
function gaussian_window(n, points, alpha = 0.4) {
	return (
		Math.E **
		(-0.5 * ((n - (points - 1) / 2) / ((alpha * (points - 1)) / 2)) ** 2)
	);
}

/**
 * @param {number} n
 * @param {number} points
 */
function tukey_window(n, points, alpha = 0.5) {
	if (n < 0.5 * alpha * (points - 1)) {
		return (
			0.5 * (1 + Math.cos(Math.PI * ((2 * n) / (alpha * (points - 1)) - 1)))
		);
	}

	if (n < (1 - 0.5 * alpha) * (points - 1)) {
		return 1;
	}

	return (
		0.5 *
		(1 + Math.cos(Math.PI * ((2 * n) / (alpha * (points - 1)) + 1 - 2 / alpha)))
	);
}

/**
 * @param {number} n
 * @param {number} points
 */
function blackman_window(n, points, alpha = 0.16) {
	return (
		0.42 -
		0.5 * Math.cos((2 * Math.PI * n) / (points - 1)) +
		0.08 * Math.cos((4 * Math.PI * n) / (points - 1))
	);
}
/**
 * @param {number} n
 * @param {number} points
 */
function exact_blackman_window(n, points) {
	return (
		0.4243801 -
		0.4973406 * Math.cos((2 * Math.PI * n) / (points - 1)) +
		0.0782793 * Math.cos((4 * Math.PI * n) / (points - 1))
	);
}

/**
 * @param {number} n
 * @param {number} points
 */
function kaiser_window(n, points, alpha = 3) {
	return (
		bessi0(Math.PI * alpha * Math.sqrt(1 - ((2 * n) / (points - 1) - 1) ** 2)) /
		bessi0(Math.PI * alpha)
	);
}

/**
 * @param {number} n
 * @param {number} points
 */
function nuttall_window(n, points) {
	return (
		0.355768 -
		0.487396 * Math.cos((2 * Math.PI * n) / (points - 1)) +
		0.144232 * Math.cos((4 * Math.PI * n) / (points - 1)) -
		0.012604 * Math.cos((6 * Math.PI * n) / (points - 1))
	);
}

/**
 * @param {number} n
 * @param {number} points
 */
function blackman_harris_window(n, points) {
	return (
		0.35875 -
		0.48829 * Math.cos((2 * Math.PI * n) / (points - 1)) +
		0.14128 * Math.cos((4 * Math.PI * n) / (points - 1)) -
		0.01168 * Math.cos((6 * Math.PI * n) / (points - 1))
	);
}

/**
 * @param {number} n
 * @param {number} points
 */
function blackman_nuttall_window(n, points) {
	return (
		0.3635819 -
		0.3635819 * Math.cos((2 * Math.PI * n) / (points - 1)) +
		0.1365995 * Math.cos((4 * Math.PI * n) / (points - 1)) -
		0.0106411 * Math.cos((6 * Math.PI * n) / (points - 1))
	);
}

/**
 * @param {number} n
 * @param {number} points
 */
function flat_top_window(n, points) {
	return (
		1 -
		1.93 * Math.cos((2 * Math.PI * n) / (points - 1)) +
		1.29 * Math.cos((4 * Math.PI * n) / (points - 1)) -
		0.388 * Math.cos((6 * Math.PI * n) / (points - 1)) +
		0.032 * Math.cos((8 * Math.PI * n) / (points - 1))
	);
}

/**
 * @param {WindowableArray} array
 * @param {(n:number, points:number, alpha?: number) => number} windowing
 * @param {number=} alpha
 * @returns {WindowableArray}
 */
function window(array, windowing, alpha) {
	const datapoints = array.length;

	/* For each item in the array */
	for (let n = 0; n < datapoints; ++n) {
		/* Apply the windowing function */
		array[n] *= windowing(n, datapoints, alpha);
	}

	return array;
}

/**
 * @param {number} n
 * @returns {number}
 */
function sinc(n) {
	return Math.sin(Math.PI * n) / (Math.PI * n);
}

/**
 * Evaluate modified Bessel function In(x) and n=0.
 * @param {number} x
 * @returns {number}
 */
function bessi0(x) {
	const ax = Math.abs(x);

	if (ax < 3.75) {
		let y = x / 3.75;
		y = y * y;
		return (
			1.0 +
			y *
				(3.5156229 +
					y *
						(3.0899424 +
							y *
								(1.2067492 +
									y * (0.2659732 + y * (0.360768e-1 + y * 0.45813e-2)))))
		);
	}

	const y = 3.75 / ax;
	return (
		(Math.exp(ax) / Math.sqrt(ax)) *
		(0.39894228 +
			y *
				(0.1328592e-1 +
					y *
						(0.225319e-2 +
							y *
								(-0.157565e-2 +
									y *
										(0.916281e-2 +
											y *
												(-0.2057706e-1 +
													y *
														(0.2635537e-1 +
															y * (-0.1647633e-1 + y * 0.392377e-2))))))))
	);
}
