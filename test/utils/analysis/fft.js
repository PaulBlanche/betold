// lifted from https://github.com/scijs/fourier-transform/blob/master/index.js and adapted to ESM

/** @typedef {number[]|Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array} FFTArray */

/**
 *
 * @param {FFTArray} input
 * @returns
 */
export function fft(input) {
	if (!input) throw Error("Input waveform is not provided, pass input array.");

	/** @type {number[]} */
	const spectrum = Array.from({ length: input.length / 2 });

	const k = Math.floor(Math.log(input.length) / Math.LN2);

	if (2 ** k !== input.length)
		throw Error("Invalid array size, must be a power of 2.");

	//.forward call
	const n = input.length;
	const x = Array.from({ length: input.length });

	reverseBinPermute(n, x, input);

	const TWO_PI = 2 * Math.PI;
	const bSi = 2 / n;
	let i = n >>> 1;
	let n2;
	let n4;
	let n8;
	let nn;
	let t1;
	let t2;
	let t3;
	let t4;
	let i1;
	let i2;
	let i3;
	let i4;
	let i5;
	let i6;
	let i7;
	let i8;
	let st1;
	let cc1;
	let ss1;
	let cc3;
	let ss3;
	let e;
	let a;
	let rval;
	let ival;
	let mag;

	for (let ix = 0, id = 4; ix < n; id *= 4) {
		for (let i0 = ix; i0 < n; i0 += id) {
			//sumdiff(x[i0], x[i0+1]) // {a, b}  <--| {a+b, a-b}
			st1 = x[i0] - x[i0 + 1];
			x[i0] += x[i0 + 1];
			x[i0 + 1] = st1;
		}
		ix = 2 * (id - 1);
	}

	n2 = 2;
	nn = n >>> 1;

	// biome-ignore lint/suspicious/noAssignInExpressions: as is in source
	while ((nn = nn >>> 1)) {
		let ix = 0;
		n2 = n2 << 1;
		let id = n2 << 1;
		n4 = n2 >>> 2;
		n8 = n2 >>> 3;
		do {
			if (n4 !== 1) {
				for (let i0 = ix; i0 < n; i0 += id) {
					i1 = i0;
					i2 = i1 + n4;
					i3 = i2 + n4;
					i4 = i3 + n4;

					//diffsum3_r(x[i3], x[i4], t1) // {a, b, s} <--| {a, b-a, a+b}
					t1 = x[i3] + x[i4];
					x[i4] -= x[i3];
					//sumdiff3(x[i1], t1, x[i3])   // {a, b, d} <--| {a+b, b, a-b}
					x[i3] = x[i1] - t1;
					x[i1] += t1;

					i1 += n8;
					i2 += n8;
					i3 += n8;
					i4 += n8;

					//sumdiff(x[i3], x[i4], t1, t2) // {s, d}  <--| {a+b, a-b}
					t1 = x[i3] + x[i4];
					t2 = x[i3] - x[i4];

					t1 = -t1 * Math.SQRT1_2;
					t2 *= Math.SQRT1_2;

					// sumdiff(t1, x[i2], x[i4], x[i3]) // {s, d}  <--| {a+b, a-b}
					st1 = x[i2];
					x[i4] = t1 + st1;
					x[i3] = t1 - st1;

					//sumdiff3(x[i1], t2, x[i2]) // {a, b, d} <--| {a+b, b, a-b}
					x[i2] = x[i1] - t2;
					x[i1] += t2;
				}
			} else {
				for (let i0 = ix; i0 < n; i0 += id) {
					i1 = i0;
					i2 = i1 + n4;
					i3 = i2 + n4;
					i4 = i3 + n4;

					//diffsum3_r(x[i3], x[i4], t1) // {a, b, s} <--| {a, b-a, a+b}
					t1 = x[i3] + x[i4];
					x[i4] -= x[i3];

					//sumdiff3(x[i1], t1, x[i3])   // {a, b, d} <--| {a+b, b, a-b}
					x[i3] = x[i1] - t1;
					x[i1] += t1;
				}
			}

			ix = (id << 1) - n2;
			id = id << 2;
		} while (ix < n);

		e = TWO_PI / n2;

		for (let j = 1; j < n8; j++) {
			a = j * e;
			ss1 = Math.sin(a);
			cc1 = Math.cos(a);

			//ss3 = sin(3*a) cc3 = cos(3*a)
			cc3 = 4 * cc1 * (cc1 * cc1 - 0.75);
			ss3 = 4 * ss1 * (0.75 - ss1 * ss1);

			ix = 0;
			id = n2 << 1;
			do {
				for (let i0 = ix; i0 < n; i0 += id) {
					i1 = i0 + j;
					i2 = i1 + n4;
					i3 = i2 + n4;
					i4 = i3 + n4;

					i5 = i0 + n4 - j;
					i6 = i5 + n4;
					i7 = i6 + n4;
					i8 = i7 + n4;

					//cmult(c, s, x, y, &u, &v)
					//cmult(cc1, ss1, x[i7], x[i3], t2, t1) // {u,v} <--| {x*c-y*s, x*s+y*c}
					t2 = x[i7] * cc1 - x[i3] * ss1;
					t1 = x[i7] * ss1 + x[i3] * cc1;

					//cmult(cc3, ss3, x[i8], x[i4], t4, t3)
					t4 = x[i8] * cc3 - x[i4] * ss3;
					t3 = x[i8] * ss3 + x[i4] * cc3;

					//sumdiff(t2, t4)   // {a, b} <--| {a+b, a-b}
					st1 = t2 - t4;
					t2 += t4;
					t4 = st1;

					//sumdiff(t2, x[i6], x[i8], x[i3]) // {s, d}  <--| {a+b, a-b}
					//st1 = x[i6] x[i8] = t2 + st1 x[i3] = t2 - st1
					x[i8] = t2 + x[i6];
					x[i3] = t2 - x[i6];

					//sumdiff_r(t1, t3) // {a, b} <--| {a+b, b-a}
					st1 = t3 - t1;
					t1 += t3;
					t3 = st1;

					//sumdiff(t3, x[i2], x[i4], x[i7]) // {s, d}  <--| {a+b, a-b}
					//st1 = x[i2] x[i4] = t3 + st1 x[i7] = t3 - st1
					x[i4] = t3 + x[i2];
					x[i7] = t3 - x[i2];

					//sumdiff3(x[i1], t1, x[i6])   // {a, b, d} <--| {a+b, b, a-b}
					x[i6] = x[i1] - t1;
					x[i1] += t1;

					//diffsum3_r(t4, x[i5], x[i2]) // {a, b, s} <--| {a, b-a, a+b}
					x[i2] = t4 + x[i5];
					x[i5] -= t4;
				}

				ix = (id << 1) - n2;
				id = id << 2;
			} while (ix < n);
		}
	}

	while (--i) {
		rval = x[i];
		ival = x[n - i - 1];
		mag = bSi * Math.sqrt(rval * rval + ival * ival);
		spectrum[i] = mag;
	}

	spectrum[0] = Math.abs(bSi * x[0]);

	return spectrum;
}

/**
 *
 * @param {number} N
 * @param {FFTArray} dest
 * @param {FFTArray} source
 */
function reverseBinPermute(N, dest, source) {
	const halfSize = N >>> 1;
	const nm1 = N - 1;
	let i = 1;
	let r = 0;
	let h;

	dest[0] = source[0];

	do {
		r += halfSize;
		dest[i] = source[r];
		dest[r] = source[i];

		i++;

		h = halfSize << 1;

		// biome-ignore lint/suspicious/noAssignInExpressions: as is in source
		// biome-ignore lint/style/noCommaOperator: as is in source
		while (((h = h >> 1), !((r ^= h) & h))) {}

		if (r >= i) {
			dest[i] = source[r];
			dest[r] = source[i];

			dest[nm1 - i] = source[nm1 - r];
			dest[nm1 - r] = source[nm1 - i];
		}
		i++;
	} while (i < halfSize);

	dest[nm1] = source[nm1];
}
