/** @import * as self from "./Timeline.js" */
import { binarySearch } from "../utils/binarySearch.js";
import * as compare from "../utils/compare.js";

/**
 * @type {self.TimelineCreator}
 */
export const Timeline = {
	create,
};

/**
 * @template {self.TransactionalEvent} EVENT
 * @type {self.TimelineCreator['create']}
 */
function create(config = {}) {
	const state = {
		/** @type {EVENT[]} */
		events: [],
	};

	/** @type {self.Timeline<EVENT>} */
	const timeline = {
		get length() {
			return state.events.length;
		},

		add,
		purgeBefore,
		has,
		remove,
		get,
		cancelAfter,
		restoreAfter,
		iterator,
		getNext,
		getPrevious,
		last,
		dispose,
	};

	return /** @type {any} */ (timeline);

	function dispose() {
		state.events.length = 0;
	}

	/** @type {self.Timeline<EVENT>['last']} */
	function last() {
		return state.events[state.events.length - 1];
	}

	/** @type {self.Timeline<EVENT>['purgeBefore']} */
	function purgeBefore(event) {
		const index = state.events.indexOf(event);

		if (index !== -1) {
			state.events = state.events.slice(index);
		}
	}

	/** @type {self.Timeline<EVENT>['add']} */
	function add(event) {
		if (
			state.events.length > 0 &&
			state.events[state.events.length - 1].time > event.time &&
			config.increasing
		) {
			throw Error("timeline state.events should be increasing");
		}

		const index = binarySearch(state.events, {
			property: "time",
			value: event.time,
			type: "last-before",
		});

		const previous = state.events[index - 1];
		const next = state.events[index + 1];
		if (
			previous?.transaction !== undefined &&
			next?.transaction === previous.transaction
		) {
			throw Error(
				"cannot schedule an event in the middle of a transaction. Cancel the transaction first.",
			);
		}

		state.events.splice(index + 1, 0, event);
	}

	/** @type {self.Timeline<EVENT>['has']} */
	function has(event) {
		return state.events.includes(event);
	}

	/** @type {self.Timeline<EVENT>['remove']} */
	function remove(event) {
		const index = state.events.indexOf(event);

		if (index !== -1) {
			const transaction = _getTransaction(index);

			if (transaction) {
				state.events.splice(
					transaction.start,
					transaction.end - transaction.start,
				);
			} else {
				state.events.splice(index, 1);
			}
		}
	}

	/** @type {self.Timeline<EVENT>['get']} */
	function get(query) {
		const index = binarySearch(/** @type {any}*/ (state.events), {
			property: "time",
			...query,
		});

		if (index === -1) {
			return undefined;
		}

		return state.events[index];
	}

	/** @type {self.Timeline<EVENT>['cancelAfter']} */
	function cancelAfter(query) {
		if (state.events.length === 0) {
			return [];
		}
		if (
			(query.inclusive ? compare.GT : compare.GTE)(
				query.time,
				state.events[state.events.length - 1].time,
			)
		) {
			return [];
		}
		if (
			(query.inclusive ? compare.LTE : compare.LT)(
				query.time,
				state.events[0].time,
			)
		) {
			return state.events.splice(0, state.events.length);
		}

		const index = binarySearch(state.events, {
			property: "time",
			value: query.time,
			type: "last-before",
			strict: query.inclusive ?? false,
		});

		const transaction = _getTransaction(index);

		let cancelFromIndex = index + 1;
		let restorableFrom = index + 1;
		if (transaction) {
			cancelFromIndex = transaction.start;
			restorableFrom = transaction.end;

			// find the first index in transaction whose event is after
			// currentTime (or transaction end if the whole transaction is
			// before currentTime). We cancel everything after that
			while (
				state.events[cancelFromIndex].time < query.currentTime &&
				cancelFromIndex < transaction.end
			) {
				cancelFromIndex += 1;
			}
		}

		for (let i = cancelFromIndex; i < restorableFrom; i++) {
			query.onCancel?.(state.events[i]);
		}

		const canceled = state.events.slice(restorableFrom);
		state.events.splice(cancelFromIndex, state.events.length - cancelFromIndex);
		return canceled;
	}

	/** @type {self.Timeline<EVENT>['restoreAfter']} */
	function restoreAfter(events, config) {
		/** @type {number|undefined} */
		let lastSkippedTransaction = undefined;

		for (const event of events) {
			if (timeline.has(event)) {
				continue;
			}
			if (event.time < config.currentTime || event.time < config.time) {
				lastSkippedTransaction = event.transaction;
				config.onCancel?.(event);
				continue;
			}
			if (
				lastSkippedTransaction !== undefined &&
				event.transaction === lastSkippedTransaction
			) {
				config.onCancel?.(event);
				continue;
			}

			config.onRestore?.(event);
			add(event);
		}
	}

	/** @type {self.Timeline<EVENT>['iterator']} */
	function iterator(config = {}) {
		return _iteratorGenerator(config);
	}

	/** @type {self.Timeline<EVENT>['getNext']} */
	function getNext(event) {
		const index = state.events.indexOf(event);

		if (index === -1 || index === state.events.length - 1) {
			return undefined;
		}

		return /** @type {EVENT} */ (state.events[index + 1]);
	}

	/** @type {self.Timeline<EVENT>['getPrevious']} */
	function getPrevious(event) {
		const index = state.events.indexOf(event);

		if (index === -1 || index === 0) {
			return undefined;
		}

		return /** @type {EVENT} */ (state.events[index - 1]);
	}

	/**
	 * @param {number} index
	 * @returns {{ start:number, end:number }|undefined}
	 */
	function _getTransaction(index) {
		const event = state.events[index];

		if (event === undefined) {
			return undefined;
		}

		let start = index;
		let end = index + 1;

		if (event.transaction === undefined || !config.transactional) {
			return undefined;
		}

		for (let i = start - 1; i >= 0; i--) {
			if (state.events[i].transaction !== event.transaction) {
				break;
			}
			start = i;
		}
		for (let i = index + 1; i < state.events.length; i++) {
			if (state.events[i].transaction !== event.transaction) {
				break;
			}
			end = i + 1;
		}

		if (end - start === 1) {
			return undefined;
		}

		return { start, end };
	}

	/**
	 * @param {self.IteratorConfig} config
	 */
	function* _iteratorGenerator(config) {
		// whistand `state.events` mutation by iterating over a copy
		const copyEvents = state.events.slice();

		const from = config.from
			? binarySearch(copyEvents, {
					property: "time",
					value: config.from.time,
					type: "first-after",
					strict: !(config.from.inclusive ?? true),
				})
			: 0;

		const to = config.to
			? binarySearch(copyEvents, {
					property: "time",
					value: config.to.time,
					type: "last-before",
					strict: !(config.to.inclusive ?? false),
				})
			: copyEvents.length - 1;

		for (let i = from; i <= to; i++) {
			yield copyEvents[i];
		}
	}
}
