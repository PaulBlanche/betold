import type { BaseContext } from "../core/BaseContext";
import type { AudioPassThrough } from "../core/node/AudioNode";
import type { DisposableNode } from "../core/node/DisposableNode";

interface SoftClipper extends AudioPassThrough<AudioNode>, DisposableNode {}

interface SoftClipperCreator {
	create(context: BaseContext): SoftClipper;
}

export let SoftClipper: SoftClipperCreator;
