/** @import * as self from "./OfflineContext.js" */
import { mixin } from "../utils/mixin.js";
import { BaseContext } from "./BaseContext.js";

/** @type {self.OfflineContextCreator} */
export const OfflineContext = {
	create,
};

/** @type {self.OfflineContextCreator['create']} */
export function create(config) {
	const sampleRate = config.sampleRate ?? 44100;
	const numberOfChannels = config.numberOfChannels ?? 2;
	const offlineAudionContext = new OfflineAudioContext({
		length: config.length * sampleRate,
		numberOfChannels,
		sampleRate,
	});

	const state = {
		currentTime: 0,
	};

	const baseContext = BaseContext.create({
		type: "offline",
		audioContext: offlineAudionContext,
		currentTime: () => state.currentTime,
		lookahead: 0,
		scheduleLookahead: 0,
	});

	return mixin(baseContext, {
		get length() {
			return offlineAudionContext.length;
		},

		startRendering,
		resume,
	});

	/** @type {self.OfflineContext['startRendering']} */
	async function startRendering({ async = true } = {}) {
		const duration = config.length;

		const blocksInASecond = Math.floor(sampleRate / 128);
		const secondsInABlock = 128 / sampleRate;
		let blocks = 0;
		while (duration - state.currentTime >= 0) {
			baseContext.clock.offlineTick();

			state.currentTime += secondsInABlock;
			blocks += 1;

			// leat main thread breath each second of audio rendered
			if (async && blocks % blocksInASecond === 0) {
				await new Promise((res) => setTimeout(res, 1));
			}
		}

		const audioBuffer = await offlineAudionContext.startRendering();

		baseContext.dispose();

		return audioBuffer;
	}

	/** @type {self.OfflineContext['resume']} */
	function resume() {
		return offlineAudionContext.resume();
	}
}
