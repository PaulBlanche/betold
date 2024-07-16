import type {
	ReactiveValue,
	ReadonlyReactiveValue,
} from "../dom/ReactiveValue";
import type { Ref } from "../dom/Ref";
import type { PropsWithChildren, Renderable } from "../dom/dom";

type ContainerProps = PropsWithChildren<{
	class?: string;
	onClose: () => void;
	title: ReadonlyReactiveValue<string>;
	position: ReactiveValue<{ x: number; y: number }>;
	_ref: Ref<HTMLElement>;
	config?: Renderable;
}>;

export function Container(props: ContainerProps): DocumentFragment;
