export type Assert = Chai.AssertStatic & {
	arrayItemEquals(
		actual: unknown[],
		expected: unknown[],
		message?: string,
	): void;
	sameSpectrum(
		actual: AudioBuffer,
		expected: AudioBuffer,
		threshold: number,
		message?: string,
	): void;
};

export let assert: Assert;
