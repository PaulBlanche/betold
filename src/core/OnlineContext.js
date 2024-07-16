/** @import * as self from "./OnlineContext.js" */
import { mixin, omit } from "../utils/mixin.js";
import { BaseContext } from "./BaseContext.js";
import { AnimationScheduler } from "./scheduler/AnimationScheduler.js";

/** @type {self.OnlineContextCreator} */
export const OnlineContext = {
	create,
};

/** @type {self.OnlineContextCreator['create']} */
export function create(config = {}) {
	const scheduleLookAhead = config.scheduleLookAhead ?? 0.1;
	const lookAhead = config.lookAhead ?? 0.05;
	const audioContext = new AudioContext({
		latencyHint: config.latencyHint,
		sampleRate: config.sampleRate ?? 44100,
	});

	const baseContext = BaseContext.create({
		type: "online",
		audioContext,
		currentTime: () => audioContext.currentTime,
		lookahead: lookAhead,
		scheduleLookahead: scheduleLookAhead,
	});

	const animationScheduler = AnimationScheduler.create({
		currentTime: () => baseContext.currentTime,
	});

	return mixin(omit(baseContext, ["dispose"]), {
		get scheduleLookAhead() {
			return scheduleLookAhead;
		},
		get lookAhead() {
			return lookAhead;
		},

		close,
		resume,
		suspend,
		scheduleAnimationFrameTask,
		cancelAnimationFrameTask,
	});

	/** @type {self.OnlineContext['scheduleAnimationFrameTask']} */
	function scheduleAnimationFrameTask(task) {
		return animationScheduler.schedule(task);
	}

	/** @type {self.OnlineContext['cancelAnimationFrameTask']} */
	function cancelAnimationFrameTask(id) {
		animationScheduler.cancel(id);
	}

	/** @type {self.OnlineContext['close']} */
	function close() {
		baseContext.dispose();
		animationScheduler.dispose();

		return audioContext.close();
	}

	/** @type {self.OnlineContext['resume']} */
	function resume() {
		return audioContext.resume();
	}

	/** @type {self.OnlineContext['suspend']} */
	function suspend() {
		return audioContext.suspend();
	}
}
