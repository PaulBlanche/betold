import type { BaseContext } from "../../core/BaseContext";
import type { AudioSink, AudioSource } from "../../core/node/AudioNode";
import type { LowRateSink, LowRateSource } from "../../core/node/LowRateNode";
import type { MessageSink, MessageSource } from "../../core/node/MessageNode";
import type { ContextAware, Environment } from "./Environment";
import type { PortConfig, PortType, SinkPort, SourcePort } from "./Port";

type PortKind = "sink" | "source";

type PortNode<
	TYPE extends PortType,
	KIND extends PortKind,
> = TYPE extends "audiorate"
	? KIND extends "sink"
		? AudioSink
		: KIND extends "source"
			? AudioSource
			: never
	: TYPE extends "lowrate"
		? KIND extends "sink"
			? LowRateSink
			: KIND extends "source"
				? LowRateSource
				: never
		: TYPE extends "message"
			? KIND extends "sink"
				? MessageSink
				: KIND extends "source"
					? MessageSource
					: never
			: never;

type GetPort = <TYPE extends PortType, KIND extends PortKind>(query: {
	name: string;
	type: TYPE;
	kind: KIND;
}) => PortNode<TYPE, KIND>;

type PatchDefinition = (env: {
	global: Map<string, unknown>;
	context: BaseContext;
	getPort: GetPort;
}) => void;

interface Patch extends ContextAware {
	setDefinition(definition: PatchDefinition): void;
	getPort(name: string): SinkPort | SourcePort;

	createPort(name: string, port: PortConfig): void;
	removePort(name: string): void;
	dispose(): void;
}

interface PatchCreator {
	create(environment: Environment): Patch;
}

export let Patch: PatchCreator;
