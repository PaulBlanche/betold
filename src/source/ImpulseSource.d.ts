import type { BaseContext } from "../core/BaseContext";
import type { ConstantSourceNode } from "../core/ConstantSourceNode";
import type { AudioSource } from "../core/node/AudioNode";
import type { DisposableNode } from "../core/node/DisposableNode";

export interface ImpulseSource extends AudioSource, DisposableNode {
	trigger(time: number): void;
}

type ImpulseSourceConfig =
	| {
			width?: number;
	  }
	| {
			curve: (cv: ConstantSourceNode, time: number) => void;
	  }
	| {
			curve: number[];
			duration: number;
	  };

interface ImpulseSourceCreator {
	create(context: BaseContext, config?: ImpulseSourceConfig): ImpulseSource;
}

export let ImpulseSource: ImpulseSourceCreator;
