import type { BaseContext } from "./BaseContext";
import type { AudioSource } from "./node/AudioNode";
import type { DisposableNode } from "./node/DisposableNode";
import type { AudioRateParam } from "./param/AudioRateParam";

type PartialableType = "sawtooth" | "square" | "triangle";

type BuiltinOscillatorType = "sine" | PartialableType;

export type OscillatorState = {
	started: boolean;
	oscillator: globalThis.OscillatorNode;
} & (
	| {
			type: BuiltinOscillatorType;
			periodicWave?: undefined;
	  }
	| {
			type: "custom";
			periodicWave: PeriodicWave;
	  }
);

export interface OscillatorNode extends AudioSource, DisposableNode {
	readonly frequency: AudioRateParam;
	readonly detune: AudioRateParam;
	readonly type: OscillatorNodeConfig["type"];

	start(time?: number): void;
	stop(startTime?: number, endTime?: number): void;
}

export type OscillatorNodeConfig = {
	frequency?: number;
	detune?: number;
} & (
	| {
			type?: BuiltinOscillatorType;
	  }
	| {
			type: "custom";
			periodicWave: PeriodicWave;
	  }
);

interface OscillatorNodeCreator {
	create(context: BaseContext, config?: OscillatorNodeConfig): OscillatorNode;
}

export let OscillatorNode: OscillatorNodeCreator;
