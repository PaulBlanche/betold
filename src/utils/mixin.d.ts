export function mixin<SOURCES extends unknown[]>(
	...sources: SOURCES
): Mixin<SOURCES>;

export function omit<SOURCE, KEYS extends (keyof SOURCE)[]>(
	source: SOURCE,
	keys: KEYS,
): FlatOmit<SOURCE, KEYS[number]>;

export type Mixin<SOURCES extends unknown[]> = Identity<
	InternalMixin<unknown, SOURCES>
>;

export type FlatOmit<SOURCE, KEYS extends keyof SOURCE> = Identity<
	Omit<SOURCE, KEYS>
>;

type InternalMixin<MIXIN, SOURCES extends unknown[]> = SOURCES extends [
	infer SOURCE,
	...infer REST,
]
	? InternalMixin<MIXIN & SOURCE, REST>
	: MIXIN;

type Identity<T> = T extends object
	? {} & {
			[P in keyof T]: T[P];
		}
	: T;

type A = Mixin<[{ foo: string }, { bar: string }]>;
