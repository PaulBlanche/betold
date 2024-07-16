import type { BaseContext } from "../../core/BaseContext";
import type { AudioPassThrough } from "../../core/node/AudioNode";
import type { DisposableNode } from "../../core/node/DisposableNode";

interface RangeToRange extends AudioPassThrough<AudioNode>, DisposableNode {}

type RangeToRangeConfig = {
	inputRange: [number, number];
	outputRange: [number, number];
};

interface RangeToRangeCreator {
	create(context: BaseContext, config: RangeToRangeConfig): RangeToRange;
}

export let RangeToRange: RangeToRangeCreator;
