import type { BaseContext } from "../BaseContext";
import type { BeatFrequencyParam } from "./BeatFrequencyParam";

type Task = {
	task: (beat: number) => void;
	interval?: number;
	iteration?: number;
	beat: number;
};

interface Transport {
	readonly beatFrequency: Omit<
		BeatFrequencyParam,
		"getBeatAtTime" | "setTimeAtBeat"
	>;

	getBeatAtTime(time: number): number;
	getTimeAtBeat(time: number): number;
	scheduleTaskAtBeat(task: Task): number;
	cancelTask(id: number): void;
	dispose(): void;
}

type TransportConfig = {
	beatFrequency?: number;
};

interface TransportCreator {
	create(context: BaseContext, config: TransportConfig): Transport;
}

export let Transport: TransportCreator;
