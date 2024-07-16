import type { TunnerConfig } from "../../core/tunner/Tunner";
import type { ContextAware } from "../core/Environment";
import type { SinkPort } from "../core/Port";

interface SequencerControl extends ContextAware {
	readonly noteMessagePort: SinkPort;
	mount(parent: HTMLElement): void;
	dispose(): void;
}

type SequencerControlConfig = {
	tunner: TunnerConfig;
	transport?: string;
};

interface ParameterControlCreator {
	create(
		environment: Environment,
		config: ParameterControlConfig,
	): ParameterControl;
}

export let ParameterControl: ParameterControlCreator;
