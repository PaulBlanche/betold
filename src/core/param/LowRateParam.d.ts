import type { BaseContext } from "../BaseContext.js";
import type { LowRatePassThrough } from "../node/LowRateNode.js";
import type { BaseParam, BaseParamConfig } from "./BaseParam.js";

export interface LowRateParam extends BaseParam, LowRatePassThrough {}

type LowRateParamConfig = Omit<BaseParamConfig, "audioParam">;

export interface LowRateParamCreator {
	create(context: BaseContext, config: LowRateParamConfig): LowRateParam;
}

export let LowRateParam: LowRateParamCreator;
