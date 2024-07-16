import type { ReactiveValue } from "../dom/ReactiveValue";
import type { Ref } from "../dom/Ref";

type NumberInputProps = {
	class?: string;
	style?: string;
	value: ReactiveValue<number>;
	id?: string;
	_ref?: Ref<HTMLInputElement>;
};

export function NumberInput(props: NumberInputProps): DocumentFragment;
