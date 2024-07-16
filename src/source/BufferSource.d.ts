import type { BaseContext } from "../core/BaseContext";
import type { AudioSource } from "../core/node/AudioNode";
import type { DisposableNode } from "../core/node/DisposableNode";
import type { AudioRateParam } from "../core/param/AudioRateParam";

export interface BufferSource extends AudioSource, DisposableNode {
	readonly detune: AudioRateParam;
	readonly playbackRate: AudioRateParam;

	start(time?: number, offset?: number): void;
	stop(stoppingTime?: number, stopTime?: number): void;
}

type BufferSourceConfig = {
	buffer: AudioBuffer;
	detune?: number;
	playbackRate?: number;
	loop?: "once" | "repeat";
	loopStart?: number;
	loopEnd?: number;
};

interface BufferSourceCreator {
	create(context: BaseContext, config: BufferSourceConfig): BufferSource;
}

export let BufferSource: BufferSourceCreator;
