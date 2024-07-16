import type { BaseContext } from "../core/BaseContext";
import type { AudioSource } from "../core/node/AudioNode";
import type { DisposableNode } from "../core/node/DisposableNode";
import type { AudioRateParam } from "../core/param/AudioRateParam";
import type { LowRateParam } from "../core/param/LowRateParam";

export interface LoopBufferSource extends AudioSource, DisposableNode {
	readonly detune: AudioRateParam;
	readonly playbackRate: AudioRateParam;
	readonly loopStart: LowRateParam;
	readonly loopEnd: LowRateParam;

	start(time?: number, offset?: number): void;
	stop(time?: number): void;
}

type LoopBufferSourceConfig = {
	buffer: AudioBuffer;
	detune?: number;
	playbackRate?: number;
	loopStart?: number;
	loopEnd?: number;
};

interface LoopBufferSourceCreator {
	create(
		context: BaseContext,
		config: LoopBufferSourceConfig,
	): LoopBufferSource;
}

export let LoopBufferSource: LoopBufferSourceCreator;
