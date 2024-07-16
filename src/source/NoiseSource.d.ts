import type { BaseContext } from "../core/BaseContext";
import type { AudioSource } from "../core/node/AudioNode";
import type { DisposableNode } from "../core/node/DisposableNode";

export interface NoiseSource extends AudioSource, DisposableNode {
	start(time?: number): void;
	stop(stoppingTime?: number, stopTime?: number): void;
}

interface NoiseSourceCreator {
	create(context: BaseContext): NoiseSource;
}

export let NoiseSource: NoiseSourceCreator;
