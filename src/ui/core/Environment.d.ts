import type { BaseContext } from "../../core/BaseContext";
import type { OfflineContextConfig } from "../../core/OfflineContext";
import type { Port, SinkPort } from "./Port";

export interface Environment {
	readonly destination: SinkPort;

	start(): void;
	stop(): void;
	render(config: OfflineContextConfig): Promise<AudioBuffer>;

	register(contextAware: ContextAware): void;
	deregister(contextAware: ContextAware): void;
}

type EnvironmentConfig = {
	scheduleLookAhead?: number;
	lookAhead?: number;
	latencyHint?: AudioContextLatencyCategory | number;
	sampleRate?: number;
	prelude?: (env: {
		context: BaseContext;
		publicize: (name: string, value: unknown) => void;
	}) => void;
};

interface EnvironmentCreator {
	create(config: EnvironmentConfig): Environment;
}

interface ContextAware {
	setContext(context: BaseContext): void;
	unsetContext(): void;
	apply(global: Map<string, unknown>): void;
}

export let Environment: EnvironmentCreator;
