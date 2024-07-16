type CompiledNode = {
	name?: string | { dyn: number };
	attributes?: (
		| {
				name: string;
				value?:
					| string
					| boolean
					| { dyn: number }
					| (string | { dyn: number })[];
		  }
		| { dyn: number }
	)[];
	children?: CompiledChild[];
};

type CompiledRoot = { children: CompiledChild[] };

type CompiledChild = CompiledNode | string | { dyn: number };

type ComponentResult =
	| DocumentFragment
	| Renderable
	| string
	| number
	| boolean
	| undefined
	| null;

interface Renderable {
	$$renderable$$: true;
	(): DocumentFragment;
}

// biome-ignore lint/complexity/noBannedTypes: is ok
type PropsWithChildren<PROPS = {}> = PROPS & {
	children?: Renderable;
};

// biome-ignore lint/complexity/noBannedTypes: is ok
type Component<PROPS = {}> = (
	props: PropsWithChildren<PROPS>,
) => ComponentResult;

// biome-ignore lint/suspicious/noExplicitAny: is ok
type AnyComponent = Component<any>;

type Context<VALUE = unknown> = {
	Provider: Component<{ value: VALUE }>;
};

export function createContext<VALUE>(defaultValue?: VALUE): Context<VALUE>;

export function useContext<VALUE>(context: Context<VALUE>): VALUE;

export function useId(prefix?: string): string;

export function compile(
	statics: TemplateStringsArray,
	..._: unknown[]
): CompiledRoot;

export function toFragment(
	compiled: CompiledRoot,
	dynamics: unknown[],
): DocumentFragment;

export function render(
	statics: TemplateStringsArray,
	...dynamics: unknown[]
): DocumentFragment;

export function fragment(
	statics: TemplateStringsArray,
	...dynamics: unknown[]
): Renderable;

export function tag<PROPS = {}>(
	component: Component<PROPS>,
	props: PROPS,
): Component;
