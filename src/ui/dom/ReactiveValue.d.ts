export interface ReactiveValue<VALUE> extends ReadonlyReactiveValue<VALUE> {
	set(value: VALUE): void;
}

export interface ReadonlyReactiveValue<VALUE> {
	get(): VALUE;
	subscribe(listener: (value: VALUE) => void): () => void;
}
