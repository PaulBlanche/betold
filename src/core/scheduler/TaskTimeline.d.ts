import type { Timeline } from "../Timeline";

export type Task = (time: number) => void;

type OnceTaskEvent = {
	type: "once";
	time: number;
	id: number;
	task: Task;
};

type RepeatTaskEvent = {
	type: "repeat";
	time: number;
	interval: number;
	iteration: number;
	id: number;
	task: Task;
};

type TaskEvent = OnceTaskEvent | RepeatTaskEvent;

interface TaskTimeline {
	readonly length: number;

	add(task: Omit<OnceTaskEvent, "id"> | Omit<RepeatTaskEvent, "id">): number;
	remove(id: number): void;
	getTaskBacklogAtTime(time: number): TaskEvent[];
	dispose(): void;
	iterator: Timeline<TaskEvent>["iterator"];
}

interface TaskTimelineCreator {
	create(): TaskTimeline;
}

export let TaskTimeline: TaskTimelineCreator;
