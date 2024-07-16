import type { Timeline, TimelineConfig } from "../Timeline.js";

export type SetTargetAtTimeEvent = {
	type: "setTargetAtTime";
	time: number;
	value: number;
	timeConstant: number;
	transaction?: number;
};

export type SetValueAtTimeEvent = {
	type: "setValueAtTime";
	time: number;
	value: number;
	transaction?: number;
};

export type RampToValueAtTime = {
	type: "rampToValueAtTime";
	exponential?: boolean;
	currentTime: number;
	time: number;
	value: number;
	transaction?: number;
};

export type ParamEvent =
	| SetTargetAtTimeEvent
	| SetValueAtTimeEvent
	| RampToValueAtTime;

export type ParamTimelineConfig = Omit<TimelineConfig, "transactional"> & {
	defaultValue: number;
};

export interface ParamTimeline extends Timeline<ParamEvent> {
	getValueAtTime(time: number): number;
	purge(time: number): void;
}

interface ParamTimelineCreator {
	create(config: ParamTimelineConfig): ParamTimeline;
}

export let ParamTimeline: ParamTimelineCreator;
