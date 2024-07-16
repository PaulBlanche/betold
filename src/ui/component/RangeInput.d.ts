import type {
	ReactiveValue,
	ReadonlyReactiveValue,
} from "../dom/ReactiveValue";
import type { Ref } from "../dom/Ref";

type RangeInputProps = {
	class?: string;
	value: ReactiveValue<number>;
	min: ReadonlyReactiveValue<number>;
	max: ReadonlyReactiveValue<number>;
	step: ReadonlyReactiveValue<number | undefined>;
	id?: string;
	_ref?: Ref<HTMLInputElement>;
};

export function RangeInput(props: RangeInputProps): DocumentFragment;
