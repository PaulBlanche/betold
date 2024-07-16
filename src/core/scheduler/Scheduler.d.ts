import type { BaseContext } from "../BaseContext";

export type Task = {
	time: number;
	interval?: number;
	iteration?: number;
	task: (time: number) => void;
};

export interface Scheduler {
	schedule(task: Task): number;
	cancel(handle: number): void;
	dispose(): void;
}

export type SchedulerConfig = {
	lookahead: number;
	currentTime?: () => number;
};

interface SchedulerCreator {
	create(context: BaseContext, config: SchedulerConfig): Scheduler;
}

export let Scheduler: SchedulerCreator;
