import type { BaseContext } from "./BaseContext";
import type { ValueEvent } from "./ValueTimeline";

type Transaction = number & { _brand: "scheduled_source_transaction" };

type StartStatus = {
	type: "start";
	//source?: globalThis.AudioScheduledSourceNode;
	stopTime?: number;
	taskId?: number;
};

type StoppingStatus = {
	type: "stopping";
};

type StopStatus = {
	type: "stop";
};

type Status = StartStatus | StopStatus | StoppingStatus;

export type StartStatusEvent = ValueEvent<StartStatus>;
export type StopStatusEvent = ValueEvent<StopStatus>;
export type StoppingStatusEvent = ValueEvent<StoppingStatus>;
export type StatusEvent = ValueEvent<Status>;

interface ScheduledSourceNode {
	begin(): Transaction;
	end(transaction: Transaction): void;
	start(time?: number, offset?: number): void;
	stop(stoppingTime?: number, stopTime?: number): void;
	dispose(): void;
}

type ScheduledSourceNodeConfig = {
	softStartSource: (time: number, offset?: number) => void;
	softStopSource: (stoppingTime: number, stopTime: number) => void;
	cancelStopSource: (time: number) => void;
};

interface ScheduledSourceNodeCreator {
	create(
		context: BaseContext,
		config: ScheduledSourceNodeConfig,
	): ScheduledSourceNode;
}

export let ScheduledSourceNode: ScheduledSourceNodeCreator;
