import type { Attack, Release } from "../../Note.js";
import type { BaseContext } from "../../core/BaseContext.js";
import type { AudioSource } from "../../core/node/AudioNode.js";
import type { DisposableNode } from "../../core/node/DisposableNode.js";
import type { LowRateParam } from "../../core/param/LowRateParam.js";

export type BasicCurve = "linear" | "exponential";
export type Curve = BasicCurve | number[];

export interface ADSREnvelope extends AudioSource, DisposableNode {
	readonly attackDuration: LowRateParam;
	attackType: Curve;
	readonly decayDuration: LowRateParam;
	decayType: BasicCurve;
	readonly sustain: LowRateParam;
	readonly releaseDuration: LowRateParam;
	releaseType: Curve;
	readonly value: number;

	getValueAtTime(time?: number): number;
	triggerAttack(note: Attack & { time: number }): void;
	triggerRelease(
		note: Release & { time: number },
	): Release & { time: number; realStop: number };
}

export type ADSREnvelopeState = {
	attackType: Curve;
	decayType: BasicCurve;
	releaseType: Curve;
};

export type ADSREnvelopeConfig = {
	attack?: { duration?: number; type?: Curve };
	decay?: { duration?: number; type?: BasicCurve };
	sustain?: number;
	release?: { duration?: number; type?: Curve };
};

interface ADSREnvelopeCreator {
	create(context: BaseContext, config?: ADSREnvelopeConfig): ADSREnvelope;
}

export let ADSREnvelope: ADSREnvelopeCreator;
