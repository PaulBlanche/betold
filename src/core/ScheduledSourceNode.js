/** @import * as self from "./ScheduledSourceNode.js" */
import { ValueTimeline } from "./ValueTimeline.js";

/** @type {self.ScheduledSourceNodeCreator} */
export const ScheduledSourceNode = {
	create,
};

/** @type {self.ScheduledSourceNodeCreator['create']} */
function create(context, config) {
	let TRANSACTION_ID = 1;

	const state = {
		/** @type {number|undefined} */
		transaction: undefined,
		/** @type {AudioScheduledSourceNode|undefined} */
		currentSource: undefined,
	};

	const statusTimeline = /** @type {ValueTimeline<self.Status>}*/ (
		ValueTimeline.create()
	);
	statusTimeline.add({ time: -1, value: { type: "stop" } });

	return {
		begin,
		end,
		start,
		stop,
		dispose,
	};

	function dispose() {
		statusTimeline.dispose();
	}

	/** @type {self.ScheduledSourceNode['begin']} */
	function begin() {
		if (state.transaction === undefined) {
			state.transaction = TRANSACTION_ID++;
			return /** @type {self.Transaction}*/ (state.transaction);
		}

		return /** @type {self.Transaction}*/ (-1);
	}

	/** @type {self.ScheduledSourceNode['end']} */
	function end(transaction) {
		if (transaction === -1) {
			return;
		}
		state.transaction = undefined;
	}

	/** @type {self.ScheduledSourceNode['start']} */
	function start(dirtyTime, offset) {
		statusTimeline.purge(context._audioContext.currentTime);

		const time =
			dirtyTime === undefined
				? context._audioContext.currentTime
				: Math.max(context._audioContext.currentTime, dirtyTime);

		const restorable = statusTimeline.cancelAfter({
			time,
			currentTime: context._audioContext.currentTime,
			onCancel: (event) => {
				if (event.value.type === "stop") {
					config.cancelStopSource(event.time);
				}
			},
		});
		statusTimeline.restoreAfter(restorable, {
			time,
			currentTime: context._audioContext.currentTime,
			onCancel: (event) => {
				if (event.value.type === "stop") {
					config.cancelStopSource(event.time);
				}
			},
		});

		const beforeOrAtTime = statusTimeline.get({
			type: "last-before",
			value: time,
		});
		const afterTime = statusTimeline.get({
			type: "first-after",
			value: time,
			strict: true,
		});

		const valueBeforeOrAtTime = beforeOrAtTime?.value ?? { type: "stop" };

		// if already started do nothing
		if (valueBeforeOrAtTime.type === "start") {
			return;
		}

		// if stopping cancel stop
		if (
			beforeOrAtTime !== undefined &&
			valueBeforeOrAtTime.type === "stopping"
		) {
			statusTimeline.remove(beforeOrAtTime);
			return;
		}

		// if a start was the next scheduled event
		if (afterTime !== undefined && _isStartStatusEvent(afterTime)) {
			// move the later start event back in time
			afterTime.time = time;

			// is the startEvent task was already run, just start the source earlier
			if (afterTime.value.taskId === undefined) {
				config.softStartSource(time);
			}

			// if the task was not started, cancel it and schedule a new one at an earlier time
			if (afterTime.value.taskId) {
				context.cancelTask(afterTime.value.taskId);
				afterTime.value.taskId = undefined;
				_scheduleStartEvent(afterTime, offset);
			}
		} else {
			/** @type {self.StartStatusEvent} */
			const startEvent = {
				time,
				value: { type: "start" },
				transaction: state.transaction,
			};

			_scheduleStartEvent(startEvent, offset);
			statusTimeline.add(startEvent);
		}
	}

	/**
	 * @param {self.StartStatusEvent} startEvent
	 * @param {number|undefined} offset
	 */
	function _scheduleStartEvent(startEvent, offset) {
		startEvent.value.taskId = context.scheduleTask({
			time: startEvent.time,
			task: () => {
				startEvent.value.taskId = undefined;

				config.softStartSource(startEvent.time, offset);

				const nextEvent = statusTimeline.getNext(startEvent);
				if (nextEvent !== undefined && nextEvent.value.type === "stopping") {
					const stopEvent = statusTimeline.getNext(nextEvent);
					if (stopEvent !== undefined && stopEvent.value.type === "stop") {
						_stopSource(nextEvent.time, stopEvent.time);
					}
				}
			},
		});
	}

	/**
	 * @param {number} stoppingTime,
	 * @param {number} stopTime,
	 */
	function _stopSource(stoppingTime, stopTime) {
		config.softStopSource(stoppingTime, stopTime);
	}

	/** @type {self.ScheduledSourceNode['stop']} */
	function stop(dirtyStoppingTime, dirtyStopTime) {
		statusTimeline.purge(context._audioContext.currentTime);

		const stoppingTime =
			dirtyStoppingTime === undefined
				? context._audioContext.currentTime
				: Math.max(context._audioContext.currentTime, dirtyStoppingTime);
		const stopTime =
			dirtyStopTime === undefined
				? stoppingTime
				: Math.max(stoppingTime, dirtyStopTime);

		const beforeOrAtStoppingTime = statusTimeline.get({
			type: "last-before",
			value: stoppingTime,
		});
		const afterStoppingTime = statusTimeline.get({
			type: "first-after",
			value: stoppingTime,
			strict: true,
		});

		const valueBeforeOrAtStoppingTime = beforeOrAtStoppingTime?.value ?? {
			type: "stop",
		};

		// if already stoped or stopping do nothing
		if (
			valueBeforeOrAtStoppingTime.type === "stopping" ||
			valueBeforeOrAtStoppingTime.type === "stop"
		) {
			return;
		}

		// if stopping was the next scheduled event, cancel it
		if (
			afterStoppingTime !== undefined &&
			_isStoppingStatusEvent(afterStoppingTime)
		) {
			statusTimeline.remove(afterStoppingTime);
		}

		/** @type {self.StopStatus} */
		const stopStatus = { type: "stop" };
		/** @type {self.StoppingStatus} */
		const stoppingStatus = { type: "stopping" };

		const transaction = begin();

		statusTimeline.add({
			time: stoppingTime,
			value: stoppingStatus,
			transaction: state.transaction,
		});

		statusTimeline.add({
			time: stopTime,
			value: stopStatus,
			transaction: state.transaction,
		});

		end(transaction);

		if (valueBeforeOrAtStoppingTime.taskId === undefined) {
			_stopSource(stoppingTime, stopTime);
		} else {
			valueBeforeOrAtStoppingTime.stopTime = stopTime;
		}
	}
}

/**
 * @param {self.StatusEvent} event
 * @returns {event is self.StartStatusEvent}
 */
function _isStartStatusEvent(event) {
	return event.value.type === "start";
}

/**
 * @param {self.StatusEvent} event
 * @returns {event is self.StoppingStatusEvent}
 */
function _isStoppingStatusEvent(event) {
	return event.value.type === "stopping";
}
