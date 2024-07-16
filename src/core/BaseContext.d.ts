import type { DisposableNode } from "./node/DisposableNode.js";
import type { Clock } from "./scheduler/Clock.js";
import type { Task } from "./scheduler/Scheduler.js";

export interface TimeGiver {
	readonly currentTime: number;
	readonly sampleRate: number;

	register(disposable: DisposableNode): void;
	deregister(disposable: DisposableNode): void;
}

export interface PrivateBaseContext extends BaseContext {
	dispose(): void;
}

export interface BaseContext extends TimeGiver {
	readonly type: "online" | "offline";
	//readonly audioWorklet: AudioWorklet;
	readonly _audioContext: BaseAudioContext;
	readonly destination: AudioDestinationNode;
	//readonly listener: AudioListener;
	//onstatechange: ((this: BaseAudioContext, ev: Event) => any) | null;
	readonly clock: Clock;
	readonly lookahead: number;
	readonly scheduleLookahead: number;
	//readonly state: AudioContextState;

	decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer>;
	resume(): Promise<void>;
	scheduleTask(task: Task): number;
	cancelTask(id: number): void;
	createPeriodicWave(real: Float32Array, imag: Float32Array): PeriodicWave;
}

export type BaseContextConfig = {
	type: "online" | "offline";
	audioContext: BaseAudioContext;
	currentTime: () => number;
	lookahead: number;
	scheduleLookahead: number;
};

interface BaseContextCreator {
	create(config: BaseContextConfig): PrivateBaseContext;
}

export let BaseContext: BaseContextCreator;
