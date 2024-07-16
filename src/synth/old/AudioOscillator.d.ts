import type { BaseContext } from "../core/BaseContext";
import type { OscillatorConfig } from "../core/OscillatorNode";
import type { AudioSource } from "../core/node/AudioNode";
import type { DisposableNode } from "../core/node/DisposableNode";
import type { NoteSink } from "../core/node/NoteNode";
import type { AudioRateParam } from "../core/param/AudioRateParam";
import type {
	ADSREnvelope,
	ADSREnvelopeConfig,
} from "../cv/audiorate/ADSREnvelope";
import type { MonoSynth } from "./Synth";

interface AudioOscillator
	extends AudioSource,
		NoteSink,
		MonoSynth,
		DisposableNode {
	readonly envelope: ADSREnvelope;
	readonly gain: AudioRateParam;
}

type AudioOscillatorConfig = {
	oscillator?: OscillatorConfig;
	envelope?: ADSREnvelopeConfig;
	gain?: number;
};

interface AudioOscillatorCreator {
	create(context: BaseContext, config?: AudioOscillatorConfig): AudioOscillator;
}

export let AudioOscillator: AudioOscillatorCreator;
