/** @import * as self from "./Clock.js" */
import { EventEmitter } from "../../utils/EventEmitter.js";

/** @type {self.ClockCreator} */
export const Clock = {
	create,
};

/** @type {self.ClockCreator['create']} */
function create(config) {
	const state = {
		updateInterval: config.updateInterval ?? 0.05,
		/** @type {number|undefined} */
		timeout: undefined,
		/** @type {Worker|undefined} */
		worker: undefined,
	};

	/** @type {EventEmitter<void>} */
	const emitter = EventEmitter.create();

	_setup();

	return {
		get updateInterval() {
			return state.updateInterval;
		},
		set updateInterval(updateInterval) {
			state.updateInterval = updateInterval;
			if (state.worker) {
				state.worker.postMessage(updateInterval * 1000);
			}
		},
		get type() {
			if (config.type === "timeout" || config.type === "worker") {
				return "online";
			}
			return config.type;
		},

		addTickListener,
		removeTickListener,
		offlineTick,
		dispose,
	};

	function dispose() {
		if (state.timeout) {
			window.clearTimeout(state.timeout);
		}
		if (state.worker) {
			state.worker.terminate();
		}
		emitter.removeAllEventListener();
	}

	/** @type {self.Clock['offlineTick']} */
	function offlineTick() {
		if (config.type !== "offline") {
			throw Error("Clock is online");
		}
		emitter.emit();
	}

	/** @type {self.Clock['addTickListener']} */
	function addTickListener(listener) {
		emitter.addEventListener(listener);
	}

	/** @type {self.Clock['removeTickListener']} */
	function removeTickListener(listener) {
		emitter.removeEventListener(listener);
	}

	function _setup() {
		if (config.type === "online" || config.type === "worker") {
			try {
				_setupWorker();
			} catch (error) {
				_setupTimeout();
			}
		}
		if (config.type === "timeout") {
			_setupTimeout();
		}
	}

	function _setupWorker() {
		state.worker = _createWorker();
		state.worker.addEventListener("message", () => emitter.emit());
	}

	function _setupTimeout() {
		state.timeout = window.setTimeout(() => {
			_setupTimeout();
			emitter.emit();
		}, state.updateInterval * 1000);
	}

	function _createWorker() {
		const blob = new Blob(
			[
				`
let timeout = ${state.updateInterval * 1000};
self.onmessage = function(msg){
	timeout = Number(msg.data);
};
function tick(){
	setTimeout(tick, timeout);
	self.postMessage('tick');
}
tick();
			`,
			],
			{ type: "text/javascript" },
		);
		const blobUrl = URL.createObjectURL(blob);
		const worker = new Worker(blobUrl);

		return worker;
	}
}
