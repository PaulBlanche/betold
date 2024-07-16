import type { AnimationClock } from "./AnimationClock";
import type { Task } from "./Scheduler";

export interface AnimationScheduler {
	schedule(task: Task): number;
	cancel(handle: number): void;
	dispose(): void;
}

export type AnimationSchedulerConfig = {
	currentTime: () => number;
};

interface AnimationSchedulerCreator {
	create(config: AnimationSchedulerConfig): AnimationScheduler;
}

export let AnimationScheduler: AnimationSchedulerCreator;
