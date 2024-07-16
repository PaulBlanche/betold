import type { Attack, Note, Pulse, Release } from "../Note";
import type { BaseContext } from "../core/BaseContext";
import type { MessageSource } from "../core/node/MessageNode";
import type { Transport } from "../core/transport/Transport";
import type { Tunner } from "../core/tunner/Tunner";

type Helpers = {
	timeNStepFromNow(n: number): number;
};

type SequencerMessage = Attack | Note | Release | Pulse;

type TimedSequencerMessage = SequencerMessage & { time: number };

type FunctionSequence = (
	step: { start: number; end: number },
	helpers: Helpers,
) => TimedSequencerMessage | TimedSequencerMessage[] | undefined | null;

type ArraySequence = (
	| SequencerMessage
	| SequencerMessage[]
	| undefined
	| null
)[];

export interface Sequencer extends MessageSource {
	stepLength: number;
	transport: Transport;
	sequence: (FunctionSequence | undefined | null)[] | ArraySequence | string;
	tunner?: Tunner;

	play(time?: number): void;
	stop(time?: number): void;
}

type SequencerConfig = {
	transport: Transport;
	stepLength: number;
	sequence: (FunctionSequence | undefined | null)[] | ArraySequence | string;
	tunner?: Tunner;
};

interface SequencerCreator {
	create(context: BaseContext, config: SequencerConfig): Sequencer;
}

export let Sequencer: SequencerCreator;
