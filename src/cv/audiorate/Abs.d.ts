import type { BaseContext } from "../../core/BaseContext";
import type { AudioPassThrough } from "../../core/node/AudioNode";
import type { DisposableNode } from "../../core/node/DisposableNode";

interface Abs extends AudioPassThrough<AudioNode>, DisposableNode {}

interface AbsCreator {
	create(context: BaseContext): Abs;
}

export let Abs: AbsCreator;
