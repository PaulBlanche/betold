import type { ContextAware, Environment } from "../core/Environment";
import type { SourcePort } from "../core/Port";

type Event = {
	type: "dispose";
};

type State = {
	min: number;
	max: number;
	step: number;
	value: number;
	title: string;
	position: { x: number; y: number };
};

interface ParameterControl extends ContextAware {
	readonly port: SourcePort;

	min: number;
	max: number;
	step: number;
	value: number;
	title: string;
	position: { x: number; y: number };

	mount(parent: HTMLElement): void;
	dispose(): void;
}

type ParameterControlConfig = {
	initialValue?: number;
	min?: number;
	max?: number;
	step?: number;
	title?: string;
	position?: { x: number; y: number };
};

interface ParameterControlCreator {
	create(
		environment: Environment,
		config: ParameterControlConfig,
	): ParameterControl;
}

export let ParameterControl: ParameterControlCreator;
