import type { BaseContext } from "../core/BaseContext";
import type {
	BuiltinOscillatorType,
	PartialableType,
} from "../core/OscillatorNode";
import type { AudioSource } from "../core/node/AudioNode";
import type { DisposableNode } from "../core/node/DisposableNode";
import type { AudioRateParam } from "../core/param/AudioRateParam";

interface OscillatorSource extends AudioSource, DisposableNode {
	readonly type:
		| { type: BuiltinOscillatorType; partial?: number }
		| PeriodicWave;
	readonly frequency: AudioRateParam;
	readonly detune: AudioRateParam;

	start(time?: number): void;
	stop(startTime?: number, endTime?: number): void;
}

type BaseOscillatorConfig = {
	frequency?: number;
	detune?: number;
};

type SineOscillatorConfig = BaseOscillatorConfig & {
	type: "sine";
	phase?: number;
};

type CustomOscillatorConfig = BaseOscillatorConfig & {
	type: "custom";
	wave: PeriodicWave;
};

type PartialableOscillatorConfig = BaseOscillatorConfig & {
	type: PartialableType;
	harmonics?: number;
	phase?: number;
};

type OscillatorSourceConfig =
	| SineOscillatorConfig
	| CustomOscillatorConfig
	| PartialableOscillatorConfig;

interface OscillatorSourceCreator {
	create(
		context: BaseContext,
		config: OscillatorSourceConfig,
	): OscillatorSource;
}

export let OscillatorSource: OscillatorSourceCreator;
