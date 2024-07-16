/**
 * @see https://webaudio.github.io/web-audio-api/#dom-audioparam-exponentialramptovalueattime
 * @param {{ time: number, value: number }} from
 * @param {{ time: number, value: number }} to
 * @param {number} at
 */
export function exponentialValue(from, to, at) {
	const timeFraction = (at - from.time) / (to.time - from.time);

	if (from.value === 0 || from.value * to.value < 0) {
		return 0;
	}

	return from.value * (to.value / from.value) ** timeFraction;
}

/**
 * @see https://webaudio.github.io/web-audio-api/#dom-audioparam-linearramptovalueattime
 * @param {{ time: number, value: number }} from
 * @param {{ time: number, value: number }} to
 * @param {number} at
 */
export function linearValue(from, to, at) {
	const timeFraction = (at - from.time) / (to.time - from.time);

	return from.value + (to.value - from.value) * timeFraction;
}

/**
 * @see https://webaudio.github.io/web-audio-api/#dom-audioparam-linearramptovalueattime
 * @param {{ time: number, value: number }} from
 * @param {{ target: number, timeConstant: number }} to
 * @param {number} at
 */
export function exponentialTarget(from, to, at) {
	return (
		to.target +
		(from.value - to.target) * Math.exp(-(at - from.time) / to.timeConstant)
	);
}

/**
 * @see https://webaudio.github.io/web-audio-api/#dom-audioparam-linearramptovalueattime
 * @param {{ time: number, value: number }} from
 * @param {{ time: number, value: number }} to
 * @param {number} at
 */
export function target(from, to, at) {
	const timeConstant = getTargetTimeConstant(from.time, to.time);
	const transitionTime = getTargetTimeConstant(from.time, to.time);

	// first 90% is exponentialTarget
	if (at < transitionTime) {
		return exponentialTarget(from, { target: to.value, timeConstant }, at);
	}

	// final 10% is linear value to target
	const fromValue = exponentialTarget(
		from,
		{ target: to.value, timeConstant },
		at,
	);
	return linearValue({ time: transitionTime, value: fromValue }, to, at);
}

/**
 * @param {number} startTime
 * @param {number} endTime
 * @returns
 */
export function getTargetTransitionTime(startTime, endTime) {
	const duration = endTime - startTime;
	return startTime + duration * 0.9;
}

/**
 * @param {number} startTime
 * @param {number} endTime
 * @returns
 */
export function getTargetTimeConstant(startTime, endTime) {
	const duration = endTime - startTime;
	return Math.log(duration + 1) / Math.log(200);
}
