/** @import * as self from "./BufferSource.js" */
import { BufferSourceNode } from "../core/BufferSourceNode.js";
import { mixin, omit } from "../utils/mixin.js";

/** @type {self.BufferSourceCreator} */
export const BufferSource = {
	create,
};

/** @type {self.BufferSourceCreator['create']} */
function create(context, config) {
	const bufferSource = BufferSourceNode.create(context, {
		buffer: config?.buffer,
		detune: config?.detune,
		playbackRate: config?.playbackRate,
		loop: config?.loop,
		loopStart: config?.loopStart,
		loopEnd: config.loopEnd,
	});

	return mixin(omit(bufferSource, ["start"]), { start });

	/** @type {self.BufferSource['start']} */
	function start(time, offset = 0) {
		if (bufferSource.loop) {
			bufferSource.start(time, bufferSource.loopStart.value + offset);
		} else {
			bufferSource.start(time, offset);
		}
	}
}
