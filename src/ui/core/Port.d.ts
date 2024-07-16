import type { AudioPassThrough } from "../../core/node/AudioNode";
import type { LowRatePassThrough } from "../../core/node/LowRateNode";
import type { MessagePassThrough } from "../../core/node/MessageNode";
import type { ContextAware, Environment } from "./Environment";

type PortType = "audiorate" | "lowrate" | "message";

type PortKind = "sink" | "source";
type PortNode<TYPE extends PortType = PortType> = TYPE extends "audiorate"
	? {
			readonly type: "audiorate";
			readonly node?: AudioPassThrough;
		}
	: TYPE extends "lowrate"
		? { readonly type: "lowrate"; readonly node?: LowRatePassThrough }
		: TYPE extends "message"
			? { readonly type: "message"; readonly node?: MessagePassThrough }
			: never;

interface BasePort<TYPE extends PortType = PortType> extends ContextAware {
	readonly portNode: PortNode<TYPE>;
	readonly kind: PortKind;

	dispose(): void;
}

interface SourcePort<TYPE extends PortType = PortType> extends BasePort<TYPE> {
	readonly sinks: SinkPort<TYPE>[];
	readonly kind: "source";

	canConnect(destination: BasePort): boolean;
	connect(destination: SinkPort<TYPE>): void;
	disconnect(destination: SinkPort<TYPE>): void;
}

interface SinkPort<TYPE extends PortType = PortType> extends BasePort<TYPE> {
	readonly kind: "sink";
}

type BasePortConfig<TYPE extends PortType = PortType> = {
	type: TYPE;
};

type PortConfig<
	TYPE extends PortType = PortType,
	KIND extends PortKind = PortKind,
> = BasePortConfig<TYPE> & { kind: KIND };

interface Port<
	TYPE extends PortType = PortType,
	KIND extends PortKind = PortKind,
> extends Omit<SinkPort<TYPE>, "kind">,
		Omit<SourcePort<TYPE>, "kind"> {
	readonly kind: KIND;
}

type CreatePort = <
	TYPE extends PortType = PortType,
	KIND extends PortKind = PortKind,
>(
	environment: Environment,
	config: PortConfig<TYPE> & { kind: KIND },
) => Port<TYPE, KIND>;

interface PortCreator {
	sink<TYPE extends PortType = PortType>(
		environment: Environment,
		config: BasePortConfig<TYPE>,
	): SinkPort<TYPE>;
	source<TYPE extends PortType = PortType>(
		environment: Environment,
		config: BasePortConfig<TYPE>,
	): SourcePort<TYPE>;
}

export let Port: PortCreator;
