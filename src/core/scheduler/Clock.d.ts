type TickListener = () => void;

export interface Clock {
	updateInterval: number;
	readonly type: "online" | "offline";
	offlineTick(): void;
	addTickListener(listener: TickListener): void;
	removeTickListener(listener: TickListener): void;
	dispose(): void;
}

export type ClockConfig = {
	type: "online" | "worker" | "timeout" | "offline";
	updateInterval?: number;
};

interface ClockCreator {
	create(config: ClockConfig): Clock;
}

export let Clock: ClockCreator;
