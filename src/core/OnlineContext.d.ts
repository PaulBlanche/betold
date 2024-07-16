import type { BaseContext } from "./BaseContext";
import type { Task } from "./scheduler/Scheduler";

export interface OnlineContext extends Omit<BaseContext, "dispose"> {
	//readonly baseLatency: number;
	//readonly outputLatency: number;
	readonly scheduleLookAhead: number;
	readonly lookAhead: number;
	close(): Promise<void>;
	//createMediaElementSource(mediaElement: HTMLMediaElement): MediaElementAudioSourceNode;
	//createMediaStreamDestination(): MediaStreamAudioDestinationNode;
	//createMediaStreamSource(mediaStream: MediaStream): MediaStreamAudioSourceNode;
	//getOutputTimestamp(): AudioTimestamp;
	suspend(): Promise<void>;
	scheduleAnimationFrameTask(task: Task): number;
	cancelAnimationFrameTask(id: number): void;
}

export type OnlineContextConfig = {
	scheduleLookAhead?: number;
	lookAhead?: number;
	latencyHint?: AudioContextLatencyCategory | number;
	sampleRate?: number;
};

interface OnlineContextCreator {
	create(config?: OnlineContextConfig): OnlineContext;
}

export let OnlineContext: OnlineContextCreator;
