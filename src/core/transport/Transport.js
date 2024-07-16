/** @import * as self from "./Transport.js" */
import { Scheduler } from "../scheduler/Scheduler.js";
import { BeatFrequency } from "./BeatFrequency.js";

/** @type {self.TransportCreator} */
export const Transport = {
	create,
};

/** @type {self.TransportCreator['create']} */
function create(context, config) {
	const beatFrequency = BeatFrequency.create(context, {
		defaultBeatFrequency: config.beatFrequency,
	});

	const beatScheduler = Scheduler.create(context, {
		lookahead: 1 / 4,
		currentTime: () =>
			beatFrequency.getBeatAtTime(context.currentTime - context.lookahead),
	});

	const self = {
		get beatFrequency() {
			return beatFrequency;
		},

		getTimeAtBeat,
		getBeatAtTime,
		scheduleTaskAtBeat,
		cancelTask,
		dispose,
	};

	context.register(self);

	return self;

	function dispose() {
		beatFrequency.dispose();
		beatScheduler.dispose();

		context.deregister(self);
	}

	/** @type {self.Transport['getBeatAtTime']} */
	function getBeatAtTime(time) {
		return beatFrequency.getBeatAtTime(time - context.lookahead);
	}

	/** @type {self.Transport['getTimeAtBeat']} */
	function getTimeAtBeat(beat) {
		return beatFrequency.getTimeAtBeat(beat) + context.lookahead;
	}

	/** @type {self.Transport['scheduleTaskAtBeat']} */
	function scheduleTaskAtBeat(task) {
		return beatScheduler.schedule({
			task: task.task,
			interval: task.interval,
			iteration: task.iteration,
			time: task.beat,
		});
	}

	/** @type {self.Transport['cancelTask']} */
	function cancelTask(id) {
		beatScheduler.cancel(id);
	}
}
