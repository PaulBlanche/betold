import type { ReactiveValue, ReadonlyReactiveValue } from "./ReactiveValue";

type Listener<STATE> = (state: STATE) => void;

interface Store<STATE> {
	getState(): STATE;
	setState(state: STATE): void;
	subscribe(listener: Listener<STATE>): () => void;
	readonlyReactive<VALUE>(
		selector: (state: STATE) => VALUE,
	): ReadonlyReactiveValue<VALUE>;
	reactive<VALUE>(
		selector: (state: STATE) => VALUE,
		updater: (state: STATE, value: VALUE) => void,
	): ReactiveValue<VALUE>;
}

type StoreConfig<STATE> = {
	initialState: STATE;
};

interface StoreCreator {
	create<STATE>(config: StoreConfig<STATE>): Store<STATE>;
}

export let Store: StoreCreator;
