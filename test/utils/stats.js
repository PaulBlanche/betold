/**
 * @param {AnyNumberArray} array
 */
export function mean(array) {
	let mean = 0;
	for (let i = 0; i < array.length; i++) {
		mean += array[i];
	}

	return mean / array.length;
}

/**
 * @param {AnyNumberArray} array
 * @param {number} mean
 */
export function stdev(array, mean) {
	let stdev = 0;
	for (let i = 0; i < array.length; i++) {
		stdev += (array[i] - mean) ** 2;
	}

	return Math.sqrt(stdev / array.length);
}

/**
 * @param {AnyNumberArray} a
 * @param {number} ma
 * @param {AnyNumberArray} b
 * @param {number} mb
 */
export function covariance(a, ma, b, mb) {
	const length = Math.min(a.length, b.length);

	let covariance = 0;
	for (let i = 0; i < length; i++) {
		covariance += (a[i] - ma) * (b[i] - mb);
	}

	return covariance / length;
}

/**
 *
 * @param {AnyNumberArray} a
 * @param {AnyNumberArray} b
 */
export function linearCorrelation(a, b) {
	const ma = mean(a);
	const mb = mean(b);
	const va = stdev(a, ma);
	const vb = stdev(b, mb);
	const vab = covariance(a, ma, b, mb);

	return vab / (va * vb);
}

/**
 * @param {AnyNumberArray} actual
 * @param {AnyNumberArray} expected
 * @returns
 */
export function wmape(actual, expected) {
	if (actual.length !== expected.length) {
		throw Error("Actual and expected should have the same size");
	}

	let norm = 0;
	let error = 0;
	for (let i = 0; i < actual.length; i++) {
		error += Math.abs(expected[i] - actual[i]);
		norm += Math.abs(actual[i]);
	}

	return error / norm;
}

/**
 * @param {AnyNumberArray} actual
 * @param {AnyNumberArray} expected
 * @returns
 */
export function rmse(actual, expected) {
	if (actual.length !== expected.length) {
		throw Error("Actual and expected should have the same size");
	}

	let error = 0;
	const range = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
	for (let i = 0; i < actual.length; i++) {
		error += (expected[i] - actual[i]) ** 2;
		if (expected[i] < range[0]) {
			range[0] = expected[i];
		}
		if (expected[i] > range[1]) {
			range[1] = expected[i];
		}
	}

	return Math.sqrt(error / actual.length) / (range[1] - range[0]);
}
