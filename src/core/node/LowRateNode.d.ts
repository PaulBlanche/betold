import type { BaseContext } from "../BaseContext.js";
import type { ReadonlyBaseParam } from "../param/BaseParam.js";
import type { DisposableNode } from "./DisposableNode.js";

export interface LowRateSource extends DisposableNode {
	read(time?: number): number;
	connectLowRate(destination: LowRateSink): void;
	disconnectLowRate(destination?: LowRateSink): void;
}

export interface LowRateSink extends DisposableNode {
	sinks: LowRateSink[];
	sources: LowRateNode[];

	read(time?: number): number;
}

export interface LowRatePassThrough extends LowRateSource, LowRateSink {}

interface LowRateNode extends LowRateSource, LowRateSink {}

type CreateLowRateNode = (
	context: BaseContext,
	param: ReadonlyBaseParam,
) => LowRateNode;

interface LowRateNodeCreator {
	source(context: BaseContext, param: ReadonlyBaseParam): LowRateSource;
	sink(context: BaseContext, param: ReadonlyBaseParam): LowRateSink;
	passthrough(
		context: BaseContext,
		param: ReadonlyBaseParam,
	): LowRatePassThrough;
}

export let LowRateNode: LowRateNodeCreator;
