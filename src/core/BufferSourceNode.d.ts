import type { BaseContext } from "./BaseContext";
import type { AudioSource } from "./node/AudioNode";
import type { DisposableNode } from "./node/DisposableNode";
import type { AudioRateParam } from "./param/AudioRateParam";
import type { LowRateParam } from "./param/LowRateParam";

export type BufferSourceState = {
	buffer: AudioBuffer;
	loop: boolean;
	currentSource: globalThis.AudioBufferSourceNode | undefined;
};

interface BufferSourceNode extends AudioSource, DisposableNode {
	readonly detune: AudioRateParam;
	readonly playbackRate: AudioRateParam;
	readonly loopStart: LowRateParam;
	readonly loopEnd: LowRateParam;
	readonly loop: boolean;

	start(time?: number, offset?: number): void;
	stop(stoppingTime?: number, stopTime?: number): void;
}

type BufferSourceConfig = {
	buffer: AudioBuffer;
	detune?: number;
	playbackRate?: number;
	loop?: "once" | "repeat" | "oscillator";
	loopStart?: number;
	loopEnd?: number;
};

interface BufferSourceNodeCreator {
	create(context: BaseContext, config: BufferSourceConfig): BufferSourceNode;
}

export let BufferSourceNode: BufferSourceNodeCreator;
