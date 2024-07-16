import type { Pulse } from "../../Note.js";
import type { BaseContext } from "../../core/BaseContext.js";
import type { AudioSource } from "../../core/node/AudioNode.js";
import type { DisposableNode } from "../../core/node/DisposableNode.js";
import type { LowRateParam } from "../../core/param/LowRateParam.js";

export type BasicCurve = "linear" | "exponential";
export type Curve = BasicCurve | number[];

export interface ADEnvelope extends AudioSource, DisposableNode {
	readonly attackDuration: LowRateParam;
	attackType: Curve;
	readonly decayDuration: LowRateParam;
	decayType: BasicCurve;
	readonly value: number;

	getValueAtTime(time?: number): number;
	triggerPulse(
		note: Pulse & { time: number },
	): Pulse & { time: number; realStop: number };
}

export type ADEnvelopeState = {
	attackType: Curve;
	decayType: BasicCurve;
};

export type ADEnvelopeConfig = {
	attack?: { duration?: number; type?: Curve };
	decay?: { duration?: number; type?: BasicCurve };
};

interface ADEnvelopeCreator {
	create(context: BaseContext, config?: ADEnvelopeConfig): ADEnvelope;
}

export let ADEnvelope: ADEnvelopeCreator;
