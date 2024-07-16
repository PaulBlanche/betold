/** @import * as self from "./LoopBufferSource.js" */
import { BufferSourceNode } from "../core/BufferSourceNode.js";

/** @type {self.LoopBufferSourceCreator} */
export const LoopBufferSource = {
	create,
};

/** @type {self.LoopBufferSourceCreator['create']} */
function create(context, config) {
	const bufferSource = BufferSourceNode.create(context, {
		buffer: config?.buffer,
		detune: config?.detune,
		playbackRate: config?.playbackRate,
		loopEnd: config.loopEnd,
		loopStart: config.loopStart,
	});

	const state = {
		stopTaskId: -1,
		/** @type {number|undefined} */
		stopTime: undefined,
	};

	return { ...bufferSource, start, stop };

	/** @type {self.LoopBufferSource['start']} */
	function start(time, offset) {
		state.stopTime = undefined;
		context.cancelTask(state.stopTaskId);
		_loop(time, offset);
	}

	/** @type {self.LoopBufferSource['stop']} */
	function stop(time = context.currentTime) {
		state.stopTaskId = context.scheduleTask({
			time,
			task: () => {
				state.stopTime = time;
			},
		});
	}

	/**
	 * @param {number=} time
	 * @param {number=} offset
	 */
	function _loop(time = context.currentTime, offset = 0) {
		if (state.stopTime !== undefined && state.stopTime <= time) {
			return;
		}

		const loopStart = bufferSource.loopStart.read(time) + offset;
		const loopEnd = bufferSource.loopEnd.read(time);
		const loopDuration = loopEnd - loopStart;
		context.scheduleTask({
			time,
			task: () => {
				if (state.stopTime !== undefined && state.stopTime <= time) {
					return;
				}

				bufferSource.start(time, loopStart);
				let loopStopTime = time + loopDuration;
				if (state.stopTime !== undefined) {
					loopStopTime = Math.min(state.stopTime, loopStopTime);
				}
				bufferSource.stop(loopStopTime);

				_loop(time + loopDuration);
			},
		});
	}
}
