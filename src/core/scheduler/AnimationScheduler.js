/** @import * as self from "./AnimationScheduler.js" */
import { AnimationClock } from "./AnimationClock.js";
import { TaskTimeline } from "./TaskTimeline.js";

/** @type {self.AnimationSchedulerCreator} */
export const AnimationScheduler = {
	create,
};

/** @type {self.AnimationSchedulerCreator['create']} */
function create(config) {
	const lookahead = 1 / 120;
	const expiration = 0.1;

	const tasks = TaskTimeline.create();
	const clock = AnimationClock.create();

	clock.addTickListener(_tick);

	return {
		schedule,
		cancel,
		dispose,
	};

	/** @type {self.AnimationScheduler['schedule']} */
	function schedule(task) {
		let id;
		if (task.interval !== undefined) {
			id = tasks.add({
				type: "repeat",
				interval: task.interval,
				time: task.time,
				task: task.task,
			});
		} else {
			id = tasks.add({
				type: "once",
				time: task.time,
				task: task.task,
			});
		}

		if (clock.status === "idle") {
			clock.resume();
		}

		return id;
	}

	/** @type {self.AnimationScheduler['cancel']} */
	function cancel(id) {
		tasks.remove(id);
	}

	function _tick() {
		const backlog = tasks.getTaskBacklogAtTime(
			config.currentTime() + lookahead,
		);

		for (const event of backlog) {
			if (event.time >= config.currentTime() - expiration) {
				event.task(event.time);
			}
		}

		if (tasks.length === 0 && clock.status === "running") {
			clock.suspend();
		}
	}

	function dispose() {
		clock.dispose();
		tasks.dispose();
	}
}
