import type { BaseContext } from "../core/BaseContext";
import type { AudioSource } from "../core/node/AudioNode";
import type { DisposableNode } from "../core/node/DisposableNode";
import type { AudioRateParam } from "../core/param/AudioRateParam";

interface PulseSource extends AudioSource, DisposableNode {
	readonly frequency: AudioRateParam;
	readonly detune: AudioRateParam;
	readonly width: AudioRateParam;

	start(time?: number): void;
	stop(startTime?: number, endTime?: number): void;
}

type PulseSourceConfig = {
	frequency?: number;
	detune?: number;
	width?: number;
};

interface PulseSourceCreator {
	create(context: BaseContext, config: PulseSourceConfig): PulseSource;
}
