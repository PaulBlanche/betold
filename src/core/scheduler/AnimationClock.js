/** @import * as self from "./AnimationClock.js" */
import { EventEmitter } from "../../utils/EventEmitter.js";

/** @type {self.AnimationClockCreator} */
export const AnimationClock = {
	create,
};

/** @type {self.AnimationClockCreator['create']} */
function create() {
	const state = {
		/** @type {number|undefined} */
		handle: undefined,
	};

	/** @type {EventEmitter<void>} */
	const emitter = EventEmitter.create();

	return {
		get status() {
			return state.handle === undefined ? "idle" : "running";
		},
		addTickListener,
		removeTickListener,
		dispose,
		suspend,
		resume,
	};

	function suspend() {
		if (state.handle) {
			cancelAnimationFrame(state.handle);
			state.handle = undefined;
		}
	}

	function resume() {
		state.handle = requestAnimationFrame(_tick);
	}

	function dispose() {
		suspend();
		emitter.removeAllEventListener();
	}

	/** @type {self.AnimationClock['addTickListener']} */
	function addTickListener(listener) {
		emitter.addEventListener(listener);
	}

	/** @type {self.AnimationClock['removeTickListener']} */
	function removeTickListener(listener) {
		emitter.removeEventListener(listener);
	}

	function _tick() {
		emitter.emit();

		state.handle = requestAnimationFrame(_tick);
	}
}
