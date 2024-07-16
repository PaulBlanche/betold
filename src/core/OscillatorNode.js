/** @import * as self from "./OscillatorNode.js" */
import { mixin } from "../utils/mixin.js";
import { GainNode } from "./GainNode.js";
import { ScheduledSourceNode } from "./ScheduledSourceNode.js";
import { AudioNode } from "./node/AudioNode.js";
import { AudioRateParam } from "./param/AudioRateParam.js";

/** @type {self.OscillatorNodeCreator} */
export const OscillatorNode = {
	create,
};

/** @type {self.OscillatorNodeCreator['create']} */
function create(context, config = {}) {
	/** @type {self.OscillatorState} */
	const state =
		config.type !== "custom"
			? {
					type: config.type ?? "sine",
					periodicWave: undefined,
					started: false,
					oscillator: context._audioContext.createOscillator(),
				}
			: {
					type: "custom",
					periodicWave: config.periodicWave,
					started: false,
					oscillator: context._audioContext.createOscillator(),
				};

	if (state.type !== "custom") {
		state.oscillator.type = state.type;
	} else {
		state.oscillator.setPeriodicWave(state.periodicWave);
	}

	const frequencyParam = AudioRateParam.create(context, {
		audioParam: state.oscillator.frequency,
		defaultValue: config.frequency ?? 440,
		min: 0,
	});

	const detuneParam = AudioRateParam.create(context, {
		audioParam: state.oscillator.detune,
		defaultValue: config.detune ?? 0,
	});

	const output = GainNode.create(context, {
		gain: 0,
	});

	state.oscillator.connect(output.sink);

	const scheduledSourceNode = ScheduledSourceNode.create(context, {
		softStartSource: (time) => {
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

	const self = mixin(source, {
		get frequency() {
			return frequencyParam;
		},
		get detune() {
			return detuneParam;
		},
		get type() {
			return state.type;
		},

		start,
		stop,
		dispose,
	});

	context.register(self);

	return self;

	/** @type {self.OscillatorNode['start']} */
	function start(time) {
		if (!state.started) {
			state.oscillator.start(time);
			state.started = true;
		}

		scheduledSourceNode.start(time);
	}

	/** @type {self.OscillatorNode['stop']} */
	function stop(stoppingTime, stopTime) {
		return scheduledSourceNode.stop(stoppingTime, stopTime);
	}

	function dispose() {
		if (state.started) {
			state.oscillator.stop();
		}
		state.oscillator.disconnect();
		state.oscillator = /** @type {any} */ (undefined);

		output.dispose();
		frequencyParam.dispose();
		detuneParam.dispose();
		scheduledSourceNode.dispose();
		source.dispose();

		context.deregister(self);
	}
}
