/** @import * as self from "./TaskTimeline.js" */
import { mixin } from "../../utils/mixin.js";
import { Timeline } from "../Timeline.js";

/** @type {self.TaskTimelineCreator} */
export const TaskTimeline = {
	create,
};

/** @type {self.TaskTimelineCreator['create']} */
function create() {
	const timeline = /** @type {Timeline<self.TaskEvent>} */ (Timeline.create());

	const state = {
		id: 0,
	};

	return mixin({
		get length() {
			return timeline.length;
		},

		add,
		remove,
		getTaskBacklogAtTime,
		dispose,
		iterator: timeline.iterator,
	});

	function dispose() {
		timeline.dispose();
	}

	/** @type {self.TaskTimeline['add']} */
	function add(event) {
		const id = state.id++;

		timeline.add({ ...event, id });

		return id;
	}

	/** @type {self.TaskTimeline['remove']} */
	function remove(id) {
		for (const event of timeline.iterator()) {
			if (event.id === id) {
				timeline.remove(event);
			}
		}
	}

	/** @type {self.TaskTimeline['getTaskBacklogAtTime']} */
	function getTaskBacklogAtTime(time) {
		const canceled = timeline.cancelAfter({
			time: -1,
			currentTime: -1,
			inclusive: true,
		});

		/** @type {self.TaskEvent[]} */
		const backlog = [];

		// event before or at time in backlog, events after added back in the
		// timeline for later
		for (const event of canceled) {
			if (event.time <= time) {
				backlog.push(event);

				// if event push in backlog is repeat, schedule the next event
				if (event.type === "repeat" && event.iteration > 1) {
					timeline.add({
						...event,
						iteration: event.iteration - 1,
						time: event.time + event.interval,
					});
				}
			} else {
				timeline.add(event);
			}
		}

		return backlog;
	}
}
