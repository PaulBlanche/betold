import type { BaseContext, TimeGiver } from "../BaseContext.js";
import type { ParamEvent } from "./ParamTimeline.js";

export type SetRampToConfig = {
	exponential?: boolean;
	endTime: number;
};

export type SetTargetAtTimeConfig = {
	endTime: number;
	startTime: number;
};

type Transaction = number & { _brand: "param_transaction" };

export interface ReadonlyBaseParam {
	value: number;

	getValueAtTime(time: number): number;
}

export interface BaseParam extends ReadonlyBaseParam {
	readonly min: number;
	readonly max: number;
	readonly defaultValue: number;

	setValueAtTime(value: number, time: number): void;
	setRampTo(value: number, config: SetRampToConfig): void;
	setTargetAtTime(value: number, config: SetTargetAtTimeConfig): void;
	setValueCurveAtTime(values: number[], time: number, duration: number): void;
	begin(): Transaction;
	end(transaction: Transaction): void;
	cancelScheduledValuesBetween(from: number, to: number): void;
	events(): IterableIterator<ParamEvent>;
	dispose(): void;
}

type BaseParamConfig = {
	audioParam?: AudioParam;
	defaultValue?: number;
	min?: number;
	max?: number;
};

interface BaseParamCreator {
	create(context: BaseContext, config?: BaseParamConfig): BaseParam;
}

export let BaseParam: BaseParamCreator;
