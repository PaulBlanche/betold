import type { BaseContext } from "../core/BaseContext";
import type { AudioPassThrough } from "../core/node/AudioNode";
import type { DisposableNode } from "../core/node/DisposableNode";

interface EnvelopeFollower
	extends AudioPassThrough<AudioNode>,
		DisposableNode {}

type EnvelopeFollowerConfig = {
	smoothing?: number;
};

interface EnvelopeFollowerCreator {
	create(
		context: BaseContext,
		config?: EnvelopeFollowerConfig,
	): EnvelopeFollower;
}

export let EnvelopeFollower: EnvelopeFollowerCreator;
