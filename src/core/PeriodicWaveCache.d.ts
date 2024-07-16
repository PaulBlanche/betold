import type { BaseContext } from "./BaseContext";

export interface PeriodicWaveCache {
	getPeriodicWave(real: Float32Array, imag: Float32Array): PeriodicWave;
	dispose(): void;
}

interface PeriodicWaveCacheCreator {
	create(context: BaseContext): PeriodicWaveCache;
}

export let PeriodicWaveCache: PeriodicWaveCacheCreator;
