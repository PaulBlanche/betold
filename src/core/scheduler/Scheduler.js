/** @import * as self from "./Scheduler.js" */
import { TaskTimeline } from "./TaskTimeline.js";

/** @type {self.SchedulerCreator} */
export const Scheduler = {
	create,
};

/** @type {self.SchedulerCreator['create']} */
function create(context, config) {
	const tasks = TaskTimeline.create();

	context.clock.addTickListener(_runTaskBacklog);

	/** @type {self.Scheduler} */
	const self = {
		schedule,
		cancel,
		dispose,
	};

	context.register(self);

	return self;

	/** @type {self.Scheduler['schedule']} */
	function schedule(task) {
		const time = task.time - config.lookahead;

		if (task.interval !== undefined) {
			return tasks.add({
				type: "repeat",
				interval: task.interval,
				iteration: task.iteration ?? Number.POSITIVE_INFINITY,
				time: time,
				task: (time) => task.task(time + config.lookahead),
			});
		}

		return tasks.add({
			type: "once",
			time: time,
			task: (time) => task.task(time + config.lookahead),
		});
	}

	/** @type {self.Scheduler['cancel']} */
	function cancel(id) {
		tasks.remove(id);
	}

	/** @type {self.Scheduler['dispose']} */
	function dispose() {
		context.deregister(self);
		tasks.dispose();
	}

	function _runTaskBacklog() {
		const currentTime = _currentTime();

		const backlog = tasks.getTaskBacklogAtTime(currentTime);
		for (const event of backlog) {
			event.task(event.time);
		}
	}

	function _currentTime() {
		return config.currentTime !== undefined
			? config.currentTime()
			: context.currentTime;
	}
}
