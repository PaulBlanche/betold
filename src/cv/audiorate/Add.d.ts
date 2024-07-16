import type { BaseContext } from "../../core/BaseContext";
import type { AudioSource } from "../../core/node/AudioNode";
import type { DisposableNode } from "../../core/node/DisposableNode";

interface Add extends AudioSource, DisposableNode {}

type AddConfig = {
	sources: AudioSource[];
};

interface AddCreator {
	create(context: BaseContext, config: AddConfig): Add;
}

export let Add: AddCreator;
