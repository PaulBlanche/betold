import type { BaseContext } from "./BaseContext";

export type RenderingConfig = {
	async?: boolean;
};

export interface OfflineContext extends Omit<BaseContext, "dispose"> {
	readonly length: number;
	startRendering(config?: RenderingConfig): Promise<AudioBuffer>;
}

export type OfflineContextConfig = {
	length: number;
	numberOfChannels?: number;
	sampleRate?: number;
};

interface OfflineContextCreator {
	create(config: OfflineContextConfig): OfflineContext;
}

export let OfflineContext: OfflineContextCreator;
