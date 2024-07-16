/** @import * as self from "./BufferSourceNode.js" */
import { mixin } from "../utils/mixin.js";
import { ConstantSourceNode } from "./ConstantSourceNode.js";
import { GainNode } from "./GainNode.js";
import { ScheduledSourceNode } from "./ScheduledSourceNode.js";
import { AudioNode } from "./node/AudioNode.js";
import { LowRateParam } from "./param/LowRateParam.js";

/** @type {self.BufferSourceNodeCreator} */
export const BufferSourceNode = {
	create,
};

/** @type {self.BufferSourceNodeCreator['create']} */
function create(context, config) {
	const loopType = config.loop ?? "once";

	/** @type {self.BufferSourceState} */
	const state = {
		buffer: config.buffer,
		loop: loopType !== "once",
		currentSource: undefined,
	};

	const detuneParam = ConstantSourceNode.create(context, {
		defaultValue: config.detune ?? 0,
	});

	const playbackRateParam = ConstantSourceNode.create(context, {
		defaultValue: config.playbackRate ?? 1,
	});

	const loopStartParam = LowRateParam.create(context, {
		min: 0,
		max: config.buffer.length / context.sampleRate,
		defaultValue: config.loopStart ?? 0,
	});

	const loopEndParam = LowRateParam.create(context, {
		min: 0,
		max: config.buffer.length / context.sampleRate,
		defaultValue: config.loopEnd ?? 0,
	});

	const output = GainNode.create(context, {
		gain: 0,
	});

	const scheduledSourceNode = ScheduledSourceNode.create(context, {
		softStartSource: (time, offset) => {
			if (loopType !== "oscillator") {
				if (state.currentSource) {
					state.currentSource.stop();
					detuneParam.connectAudio(state.currentSource.detune);
					playbackRateParam.connectAudio(state.currentSource.playbackRate);
					state.currentSource.disconnect();
				}

				state.currentSource = _createSource(time);
				state.currentSource.start(time, offset);
			}

			output.gain.setValueAtTime(1, time);
		},
		softStopSource: (stoppingTime, stopTime) => {
			output.gain.setValueAtTime(0, stopTime);
		},
		cancelStopSource: (time) => {
			output.gain.cancelScheduledValuesBetween(
				time,
				time + 1 / context.sampleRate,
			);
		},
	});

	const source = AudioNode.source({
		source: output,
	});

	if (loopType === "oscillator") {
		state.currentSource = _createSource(0);
		state.currentSource.start(0);
	}

	const self = mixin(source, {
		get detune() {
			return detuneParam;
		},
		get playbackRate() {
			return playbackRateParam;
		},
		get loopEnd() {
			return loopEndParam;
		},
		get loopStart() {
			return loopStartParam;
		},
		get loop() {
			return state.loop;
		},

		start,
		stop,
		dispose,
	});

	context.register(self);

	return self;

	/** @type {self.BufferSourceNode['start']} */
	function start(time, offset) {
		return scheduledSourceNode.start(time, offset);
	}

	/** @type {self.BufferSourceNode['stop']} */
	function stop(stoppingTime, stopTime) {
		return scheduledSourceNode.stop(stoppingTime, stopTime);
	}

	/**
	 * @param {number} time
	 */
	function _createSource(time) {
		const bufferSource = context._audioContext.createBufferSource();
		bufferSource.buffer = state.buffer;
		bufferSource.detune.value = 0;
		bufferSource.playbackRate.value = 0;
		bufferSource.loop = state.loop;
		bufferSource.loopStart = loopStartParam.read(time);
		bufferSource.loopEnd = loopEndParam.read(time);

		detuneParam.connectAudio(bufferSource.detune);
		playbackRateParam.connectAudio(bufferSource.playbackRate);
		bufferSource.connect(output.sink);

		return bufferSource;
	}

	function dispose() {
		if (state.currentSource) {
			state.currentSource.stop();
			state.currentSource.disconnect();
			state.currentSource = undefined;
		}

		detuneParam.dispose();
		playbackRateParam.dispose();
		loopEndParam.dispose();
		loopStartParam.dispose();
		output.dispose();
		scheduledSourceNode.dispose();
		source.dispose();

		context.deregister(self);
	}
}
