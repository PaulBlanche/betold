import { assert } from "../../../test/assert.js";
import { TaskTimeline } from "./TaskTimeline.js";

suite("TaskTimeline", async () => {
	test("give the backlog for a given time", () => {
		const sequence = TaskTimeline.create();
		/** @type {import("./TaskTimeline.js").Task[]} */
		const tasks = [() => {}, () => {}, () => {}, () => {}, () => {}];
		sequence.add({ type: "once", time: 1, task: tasks[0] });
		sequence.add({
			type: "repeat",
			interval: 1,
			iteration: 5,
			time: 2,
			task: tasks[1],
		});
		sequence.add({ type: "once", time: 2, task: tasks[2] });
		sequence.add({ type: "once", time: 3, task: tasks[3] });
		sequence.add({ type: "once", time: 4, task: tasks[4] });

		const backlog = sequence.getTaskBacklogAtTime(2);
		assert.arrayItemEquals(
			backlog.map((item) => tasks.indexOf(item.task)),
			[0, 1, 2],
		);
	});

	test("getting a backlog remove the tasks from the sequence", () => {
		const sequence = TaskTimeline.create();
		/** @type {import("./TaskTimeline.js").Task[]} */
		const tasks = [() => {}, () => {}, () => {}, () => {}, () => {}];
		sequence.add({ type: "once", time: 1, task: tasks[0] });
		sequence.add({
			type: "repeat",
			interval: 1,
			iteration: 5,
			time: 2,
			task: tasks[1],
		});
		sequence.add({ type: "once", time: 2, task: tasks[2] });
		sequence.add({ type: "once", time: 3, task: tasks[3] });
		sequence.add({ type: "once", time: 4, task: tasks[4] });

		sequence.getTaskBacklogAtTime(2);
		const backlog = sequence.getTaskBacklogAtTime(8);
		assert.arrayItemEquals(
			backlog.map((item) => tasks.indexOf(item.task)),
			[1, 3, 4],
		);
		assert.isTrue(backlog[0].type === "repeat");
		if (backlog[0].type === "repeat") {
			assert.strictEqual(backlog[0].time, 3);
			assert.strictEqual(backlog[0].iteration, 4);
		}
	});

	test("tasks can be removed", () => {
		const sequence = TaskTimeline.create();
		/** @type {import("./TaskTimeline.js").Task[]} */
		const tasks = [() => {}];
		const id = sequence.add({ type: "once", time: 1, task: tasks[0] });
		sequence.remove(id);

		const backlog = sequence.getTaskBacklogAtTime(1);
		assert.arrayItemEquals(
			backlog.map((item) => item.task),
			[],
		);
	});

	test("backlog with only one task at time", () => {
		const sequence = TaskTimeline.create();
		/** @type {import("./TaskTimeline.js").Task[]} */
		const tasks = [() => {}];
		sequence.add({ type: "once", time: 1, task: tasks[0] });

		const backlog = sequence.getTaskBacklogAtTime(1);
		assert.arrayItemEquals(
			backlog.map((item) => tasks.indexOf(item.task)),
			[0],
		);
	});
});
