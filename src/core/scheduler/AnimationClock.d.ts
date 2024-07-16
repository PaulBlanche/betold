type TickListener = () => void;

export interface AnimationClock {
	readonly status: "idle" | "running";
	suspend(): void;
	resume(): void;
	addTickListener(listener: TickListener): void;
	removeTickListener(listener: TickListener): void;
	dispose(): void;
}

interface AnimationClockCreator {
	create(): AnimationClock;
}

export let AnimationClock: AnimationClockCreator;
