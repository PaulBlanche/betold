import type { BaseContext } from "../BaseContext.js";
import type { AudioSink } from "../node/AudioNode.js";
import type { BaseParam, BaseParamConfig } from "./BaseParam.js";

export interface AudioRateParam extends AudioSink<AudioParam>, BaseParam {
	readonly _param: AudioParam;
}

type AudioRateParamConfig = Omit<BaseParamConfig, "audioParam"> & {
	audioParam: AudioParam | AudioRateParam;
};

export interface AudioRateParamCreator {
	create(context: BaseContext, config: AudioRateParamConfig): AudioRateParam;
}

export let AudioRateParam: AudioRateParamCreator;
