import type { BaseContext } from "../BaseContext.js";
import type { AudioSink } from "../node/AudioNode.js";
import type { AudioRateParam } from "../param/AudioRateParam.js";

export type SetFrequencyAtTimeEvent = {
	type: "setFrequencyAtTime";
	frequency: number;
	time: number;
	beat: number;
};

export type RampToFrequencyAtTime = {
	type: "rampToFrequencyAtTime";
	frequency: number;
	time: number;
	currentTime: number;
	beat: number;
};

type BeatFrequencyEvent = SetFrequencyAtTimeEvent | RampToFrequencyAtTime;

export interface BeatFrequencyParam extends AudioSink<AudioParam> {
	setValueAtTime(frequency: number, time: number): void;
	getValueAtTime(time: number): number;
	setRampTo(frequency: number, config: { endTime: number }): void;
	getBeatAtTime(time: number): number;
	getTimeAtBeat(time: number): number;
	dispose(): void;
}

type BeatFrequencyParamConfig = {
	audioParam: AudioParam | AudioRateParam;
	defaultBeatFrequency?: number;
};

interface BeatFrequencyParamCreator {
	create(
		context: BaseContext,
		config: BeatFrequencyParamConfig,
	): BeatFrequencyParam;
}

export let BeatFrequencyParam: BeatFrequencyParamCreator;
