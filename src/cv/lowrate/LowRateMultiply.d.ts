import type { BaseContext } from "../../core/BaseContext";
import type { DisposableNode } from "../../core/node/DisposableNode";
import type { LowRateNode, LowRateSource } from "../../core/node/LowRateNode";

interface LowRateMultiply extends LowRateSource, DisposableNode {}

type LowRateMultiplyConfig = {
	sources: (number | LowRateSource)[];
};

interface LowRateMultiplyCreator {
	create(context: BaseContext, config: LowRateMultiplyConfig): LowRateMultiply;
}

export let LowRateMultiply: LowRateMultiplyCreator;
