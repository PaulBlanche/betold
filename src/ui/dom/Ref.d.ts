interface Ref<ELEMENT extends HTMLElement = HTMLElement> {
	readonly node: ELEMENT;
	dispose(): void;
}

interface PrivateRef<ELEMENT extends HTMLElement = HTMLElement>
	extends Ref<ELEMENT> {
	setNode(node: ELEMENT): void;
}

type CreatePrivateRef = <
	ELEMENT extends HTMLElement = HTMLElement,
>() => PrivateRef<ELEMENT>;

interface RefCreator {
	create<ELEMENT extends HTMLElement = HTMLElement>(): Ref<ELEMENT>;
}

export let Ref: RefCreator;

export function isRef(value: unknown): value is PrivateRef;
