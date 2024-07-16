import type { BaseContext } from "../../core/BaseContext";
import type { AudioSource } from "../../core/node/AudioNode";
import type { DisposableNode } from "../../core/node/DisposableNode";

interface Multiply extends AudioSource, DisposableNode {}

type MultiplyConfig = {
	sources: (number | AudioSource)[];
};

interface MultiplyCreator {
	create(context: BaseContext, config: MultiplyConfig): Multiply;
}

export let Multiply: MultiplyCreator;
