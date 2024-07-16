import type { BinarySearchQuery } from "../utils/binarySearch";

export type TransactionalEvent = {
	time: number;
	transaction?: number;
};

export type Type = "last-before" | "first-after";

export type SearchQuery<KEY extends string | symbol | number = "time"> = Omit<
	BinarySearchQuery<KEY>,
	"property"
> & {
	property?: KEY;
};

export type CancelAfterQuery<EVENT> = {
	time: number;
	currentTime: number;
	inclusive?: boolean;
	onCancel?: (event: EVENT) => void;
};

export type RestoreAfterConfig<EVENT> = {
	time: number;
	currentTime: number;
	onRestore?: (event: EVENT) => void;
	onCancel?: (event: EVENT) => void;
};

export type IteratorConfig = {
	from?: { time: number; inclusive?: boolean };
	to?: { time: number; inclusive?: boolean };
};

export interface Timeline<EVENT extends TransactionalEvent> {
	readonly length: number;

	add(event: EVENT): void;
	has(event: EVENT): boolean;
	remove(event: EVENT): void;
	get<KEY extends keyof EVENT = "time">(
		query: SearchQuery<KEY>,
	): EVENT | undefined;
	cancelAfter(query: CancelAfterQuery<EVENT>): EVENT[];
	restoreAfter(events: EVENT[], config: RestoreAfterConfig<EVENT>): void;
	iterator(config?: IteratorConfig): IterableIterator<EVENT>;
	getNext(event: EVENT): EVENT | undefined;
	getPrevious(event: EVENT): EVENT | undefined;
	last(): EVENT | undefined;
	purgeBefore(event: EVENT): void;
	dispose(): void;
}

type TimelineConfig = {
	transactional?: boolean;
	increasing?: boolean;
};

interface TimelineCreator {
	create<EVENT extends TransactionalEvent>(
		config?: TimelineConfig,
	): Timeline<EVENT>;
}

export let Timeline: TimelineCreator;
