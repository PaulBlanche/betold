export type EventListener<EVENT = unknown> = (event: EVENT) => void;

export interface EventEmitter<EVENT = unknown> {
	addEventListener(listener: EventListener<EVENT>): void;
	removeEventListener(listener: EventListener<EVENT>): void;
	removeAllEventListener(): void;

	emit(event: EVENT): void;
}

interface EventEmitterCreator {
	create<EVENT = unknown>(): EventEmitter<EVENT>;
}

export let EventEmitter: EventEmitterCreator;

export function merge<A extends unknown[]>(
	...emitters: { [K in keyof A]: EventEmitter<K> }
): EventEmitter<A[number]>;
