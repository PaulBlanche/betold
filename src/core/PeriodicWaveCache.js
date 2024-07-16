/** @import * as self from "./PeriodicWaveCache.js" */

/** @type {self.PeriodicWaveCacheCreator} */
export const PeriodicWaveCache = {
	create,
};

/** @type {self.PeriodicWaveCacheCreator['create']} */
function create(context) {
	/** @type {Map<string, PeriodicWave>} */
	const cache = new Map();

	/** @type {self.PeriodicWaveCache} */
	const self = {
		getPeriodicWave,
		dispose,
	};

	context.register(self);

	return self;

	/** @type {self.PeriodicWaveCache['getPeriodicWave']} */
	function getPeriodicWave(real, imag) {
		const hash = periodicWaveHash(real, imag);
		if (!cache.has(hash)) {
			cache.set(hash, context._audioContext.createPeriodicWave(real, imag));
		}

		const periodicWave = cache.get(hash);
		if (periodicWave === undefined) {
			throw Error("this can't happen");
		}

		return periodicWave;
	}

	function dispose() {
		cache.clear();
		context.deregister(self);
	}
}

/**
 * @param {Float32Array} real
 * @param {Float32Array} imag
 */
function periodicWaveHash(real, imag) {
	const realInt = new Uint32Array(real.buffer);
	const imagInt = new Uint32Array(imag.buffer);

	let hash = 0;
	for (const i of realInt) {
		hash = (hash << 5) - hash + i;
		hash = hash & hash;
	}
	for (const i of imagInt) {
		hash = (hash << 5) - hash + i;
		hash = hash & hash;
	}

	return hash.toString(36);
}
