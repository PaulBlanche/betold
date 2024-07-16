/** @import * as self from "./Store.js" */

import { EventEmitter } from "../../utils/EventEmitter.js";

/** @type {self.StoreCreator} */
export const Store = {
	create,
};

/**
 * @type {self.StoreCreator['create']}
 */
function create(config) {
	/** @typedef {typeof config['initialState']} STATE */
	const state = {
		value: config.initialState,
	};

	/** @type {self.Listener<STATE>[]} */
	const listeners = [];

	/** @type {self.Store<STATE>} */
	const self = {
		getState,
		setState,
		subscribe,
		readonlyReactive,
		reactive,
	};

	return self;

	/** @type {self.Store<STATE>['getState']} */
	function getState() {
		return state.value;
	}

	/** @type {self.Store<STATE>['setState']} */
	function setState(nextState) {
		state.value = nextState;
		for (const listener of listeners) {
			listener(state.value);
			if (state.value !== nextState) {
				break;
			}
		}
	}

	/** @type {self.Store<STATE>['subscribe']} */
	function subscribe(listener) {
		listeners.push(listener);
		return () => {
			const index = listeners.indexOf(listener);
			if (index !== -1) {
				listeners.splice(index, 1);
			}
		};
	}

	/** @type {self.Store<STATE>['readonlyReactive']} */
	function readonlyReactive(selector) {
		return {
			get: () => selector(state.value),
			subscribe: (listener) => {
				return subscribe((state) => {
					listener(selector(state));
				});
			},
		};
	}

	/** @type {self.Store<STATE>['reactive']} */
	function reactive(selector, updater) {
		return {
			...readonlyReactive(selector),
			set: (value) => updater(state.value, value),
		};
	}
}
