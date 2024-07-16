import type { AudioRateParam } from "../param/AudioRateParam.js";

type ResolvableSource = AudioSource | globalThis.AudioNode;

type ResolvableSink =
	| AudioSink
	| globalThis.AudioNode
	| AudioRateParam
	| AudioParam;
type ResolvedSink = globalThis.AudioNode | AudioParam;
type ResolveSink<SINK extends ResolvableSink> = SINK extends
	| AudioRateParam
	| AudioParam
	? AudioParam
	: globalThis.AudioNode;

export interface AudioSource {
	readonly source: globalThis.AudioNode;
	readonly numberOfOutputs: number;

	connectAudio(
		destination: ResolvableSink,
		outputIndex?: number,
		inputIndex?: number,
	): void;
	disconnectAudio(
		destination?: ResolvableSink,
		outputIndex?: number,
		inputIndex?: number,
	): void;
	dispose(): void;
}

export interface AudioSink<SINK extends ResolvedSink = ResolvedSink> {
	readonly sink: SINK;
	readonly numberOfInputs: number;

	dispose(): void;
}

export interface AudioPassThrough<SINK extends ResolvedSink = ResolvedSink>
	extends AudioSource,
		AudioSink<SINK> {}

type AudioNodeSink = Omit<AudioSink, "sink"> & Partial<Pick<AudioSink, "sink">>;
type AudioNodeSource = Omit<AudioSource, "source"> &
	Partial<Pick<AudioSource, "source">>;

export interface AudioNode extends AudioNodeSource, AudioNodeSink {}

export type AudioSinkConfig<SINK extends ResolvableSink = ResolvableSink> = {
	sink: SINK;
};

export type AudioSourceConfig = {
	source: AudioSource | globalThis.AudioNode;
};

export type AudioPassThroughConfig<
	SINK extends ResolvableSink = ResolvableSink,
> = AudioSinkConfig<SINK> & AudioSourceConfig;

export type AudioNodeConfig = Partial<AudioSinkConfig> &
	Partial<AudioSourceConfig>;

type CreateAudioNode = (config: AudioNodeConfig) => AudioNode;

interface AudioNodeCreator {
	passthrough<SINK extends ResolvableSink = ResolvableSink>(
		config: AudioPassThroughConfig<SINK>,
	): AudioPassThrough<ResolveSink<SINK>>;
	sink<SINK extends ResolvableSink = ResolvableSink>(
		config: AudioSinkConfig<SINK>,
	): AudioSink<ResolveSink<SINK>>;
	source(config: AudioSourceConfig): AudioSource;
}

export let AudioNode: AudioNodeCreator;
