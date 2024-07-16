/** @import * as self from "./Environment.js" */
/** @import { SinkPort } from "./Port.js" */
/** @import { BaseContext } from "../../core/BaseContext.js"; */
import { ConstantSourceNode } from "../../core/ConstantSourceNode.js";
import { GainNode } from "../../core/GainNode.js";
import { OfflineContext } from "../../core/OfflineContext.js";
import { OnlineContext } from "../../core/OnlineContext.js";
import { OscillatorNode } from "../../core/OscillatorNode.js";
import { Port } from "./Port.js";

/** @type {self.EnvironmentCreator} */
export const Environment = {
	create,
};

/** @type {self.EnvironmentCreator['create']} */
function create(config) {
	const state = {
		/** @type {self.ContextAware[]} */
		contextAwares: [],
		/** @type {OnlineContext|undefined} */
		onlineContext: undefined,
	};

	/** @type {{name:string, factory:(context: BaseContext) => any}[]} */
	const globalFactories = [];

	/** @type {SinkPort} */
	let destination;

	/** @type {self.Environment} */
	const self = {
		get destination() {
			if (destination === undefined) {
				destination = Port.sink(self, {
					type: "audiorate",
				});
			}
			return destination;
		},

		register,
		deregister,
		start,
		stop,
		render,
	};

	return self;

	/** @type {self.Environment['register']} */
	function register(appliable) {
		state.contextAwares.push(appliable);
	}

	/** @type {self.Environment['register']} */
	function deregister(appliable) {
		const index = state.contextAwares.indexOf(appliable);
		if (index !== -1) {
			state.contextAwares.splice(index, 1);
		}
	}

	/**
	 * @param {BaseContext} context
	 */
	function _start(context) {
		for (const contextAware of state.contextAwares) {
			contextAware.setContext(context);
		}

		const exported = new Map();
		config.prelude?.({
			context,
			publicize: (name, value) => exported.set(name, value),
		});

		for (const contextAware of state.contextAwares) {
			contextAware.apply(exported);
		}
	}

	function _stop() {
		for (const contextAware of state.contextAwares) {
			console.log(contextAware);
			contextAware.unsetContext();
		}
	}

	/** @type {self.Environment['start']} */
	function start() {
		state.onlineContext = OnlineContext.create({
			scheduleLookAhead: config.scheduleLookAhead,
			lookAhead: config.lookAhead,
			latencyHint: config.latencyHint,
			sampleRate: config.sampleRate,
		});

		_start(state.onlineContext);

		if (
			destination.portNode.type === "audiorate" &&
			destination.portNode.node
		) {
			destination.portNode.node.connectAudio(state.onlineContext.destination);
		}
	}

	/** @type {self.Environment['stop']} */
	function stop() {
		if (state.onlineContext) {
			state.onlineContext.close();
			state.onlineContext = undefined;

			_stop();
		}
	}

	/** @type {self.Environment['render']} */
	async function render(config) {
		const context = OfflineContext.create(config);

		_start(context);

		if (
			destination.portNode.type === "audiorate" &&
			destination.portNode.node
		) {
			destination.portNode.node.connectAudio(context.destination);
		}

		const audioBuffer = await context.startRendering();

		_stop();

		return audioBuffer;
	}
}
