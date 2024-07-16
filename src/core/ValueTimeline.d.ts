import type { Timeline, TransactionalEvent } from "./Timeline";

type ValueEvent<VALUE> = TransactionalEvent & {
	value: VALUE;
};

export interface ValueTimeline<VALUE> extends Timeline<ValueEvent<VALUE>> {
	purge(time: number): void;
}

interface ValueTimelineCreator {
	create<VALUE>(): ValueTimeline<VALUE>;
}

export let ValueTimeline: ValueTimelineCreator;
