/** @import * as self from "./BaseContext.js" */
/** @import { DisposableNode } from "./node/DisposableNode.js" */
import { PeriodicWaveCache } from "./PeriodicWaveCache.js";
import { Clock } from "./scheduler/Clock.js";
import { Scheduler } from "./scheduler/Scheduler.js";

export const BaseContext = {
	create,
};

/** @type {self.BaseContextCreator['create']} */
export function create(config) {
	const clock = Clock.create({
		type: config.type,
	});

	/** @type {DisposableNode[]} */
	const disposables = [];

	/** @type {self.PrivateBaseContext} */
	const self = {
		get type() {
			return config.type;
		},
		get currentTime() {
			return config.currentTime() + config.lookahead;
		},
		get sampleRate() {
			return config.audioContext.sampleRate;
		},
		get destination() {
			return config.audioContext.destination;
		},
		get _audioContext() {
			return config.audioContext;
		},
		get clock() {
			return clock;
		},
		get scheduleLookahead() {
			return config.scheduleLookahead;
		},
		get lookahead() {
			return config.lookahead;
		},

		resume,
		scheduleTask,
		cancelTask,
		createPeriodicWave,
		decodeAudioData,
		register,
		deregister,
		dispose,
	};

	const scheduler = Scheduler.create(self, {
		lookahead: config.lookahead,
	});

	const periodicWaveCache = PeriodicWaveCache.create(self);

	return self;

	function dispose() {
		for (const disposable of disposables) {
			disposable.dispose();
		}
	}

	/** @type {self.BaseContext['register']} */
	function register(disposable) {
		disposables.push(disposable);
	}

	/** @type {self.BaseContext['deregister']} */
	function deregister(disposable) {
		const index = disposables.indexOf(disposable);
		if (index !== -1) {
			disposables.splice(index, 1);
		}
	}

	/** @type {self.BaseContext['decodeAudioData']} */
	function decodeAudioData(buffer) {
		return config.audioContext.decodeAudioData(buffer);
	}

	/** @type {self.BaseContext['createPeriodicWave']} */
	function createPeriodicWave(real, imag) {
		return periodicWaveCache.getPeriodicWave(real, imag);
	}

	/** @type {self.BaseContext['resume']} */
	function resume() {
		if (config.audioContext instanceof OfflineAudioContext) {
			return config.audioContext.resume();
		}
		if (config.audioContext instanceof AudioContext) {
			return config.audioContext.resume();
		}
		return Promise.resolve();
	}

	/** @type {self.BaseContext['scheduleTask']} */
	function scheduleTask(task) {
		return scheduler.schedule(task);
	}

	/** @type {self.BaseContext['cancelTask']} */
	function cancelTask(id) {
		scheduler.cancel(id);
	}
}
