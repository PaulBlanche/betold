/** @import * as self from './EventEmitter' */

/** @type {self.EventEmitterCreator} */
export const EventEmitter = {
	create,
};

/**
 * @template EVENT
 * @type {self.EventEmitterCreator['create']}
 */
function create() {
	/** @type {self.EventListener<EVENT>[]} */
	const listeners = [];

	/** @type {self.EventEmitter<EVENT>}*/
	const eventEmitter = {
		addEventListener,
		removeEventListener,
		removeAllEventListener,
		emit,
	};

	return /**  @type {any} */ (eventEmitter);

	/** @type {self.EventEmitter<EVENT>['emit']} */
	function emit(event) {
		for (const listener of listeners) {
			listener(event);
		}
	}

	/** @type {self.EventEmitter<EVENT>['addEventListener']} */
	function addEventListener(listener) {
		listeners.push(listener);
	}

	/** @type {self.EventEmitter<EVENT>['removeEventListener']} */
	function removeEventListener(listener) {
		const index = listeners.indexOf(listener);
		if (index !== -1) {
			listeners.splice(index, 1);
		}
	}

	/** @type {self.EventEmitter<EVENT>['removeAllEventListener']} */
	function removeAllEventListener() {
		listeners.length = 0;
	}
}

/** @type {self.merge} */
export function merge(...emitters) {
	/** @type {self.EventEmitter}*/
	const eventEmitter = {
		addEventListener(listener) {
			for (const emitter of emitters) {
				emitter.addEventListener(listener);
			}
		},
		removeEventListener(listener) {
			for (const emitter of emitters) {
				emitter.removeEventListener(listener);
			}
		},
		removeAllEventListener() {
			for (const emitter of emitters) {
				emitter.removeAllEventListener();
			}
		},
		emit(event) {
			for (const emitter of emitters) {
				emitter.emit(event);
			}
		},
	};

	return eventEmitter;
}
