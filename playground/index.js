import { BiquadFilterNode } from "../src/core/BiquadFilterNode.js";
import { BufferSourceNode } from "../src/core/BufferSourceNode.js";
import { ConstantSourceNode } from "../src/core/ConstantSourceNode.js";
import { GainNode } from "../src/core/GainNode.js";
import { OfflineContext } from "../src/core/OfflineContext.js";
//import { GainNode } from "../src/core/GainNode.js";
//import { OfflineContext } from "../src/core/OfflineContext.js";
import { OnlineContext } from "../src/core/OnlineContext.js";
import { OscillatorNode } from "../src/core/OscillatorNode.js";
import { MessageNode } from "../src/core/node/MessageNode.js";
import { Transport } from "../src/core/transport/Transport.js";
import { Tunner } from "../src/core/tunner/Tunner.js";
import { ADEnvelope } from "../src/cv/audiorate/ADEnvelope.js";
import { ADSREnvelope } from "../src/cv/audiorate/ADSREnvelope.js";
import { RangeToRange } from "../src/cv/audiorate/RangeToRange.js";
import { SoftClipper } from "../src/effect/SoftClipper.js";
import { Sequencer } from "../src/instrument/Sequencer.js";
import { BufferSource } from "../src/source/BufferSource.js";
import { LoopBufferSource } from "../src/source/LoopBufferSource.js";
import { NoiseSource } from "../src/source/NoiseSource.js";
import { OscillatorSource } from "../src/source/OscillatorSource.js";
import { Impact } from "../src/synth/drum/bass/Impact.js";
import { Kick } from "../src/synth/drum/bass/Kick.js";
import { ParameterControl } from "../src/ui/component/ParameterControl.js";
import { Environment } from "../src/ui/core/Environment.js";
import { Patch } from "../src/ui/core/Patch.js";
import { saveWaveFile } from "../test/utils/wave/saveWaveFile.js";
import "../src/ui/base.css";
/*import { Transport } from "../src/core/transport/Transport.js";
import { Tunner } from "../src/core/tunner/Tunner.js";
import { SoftClipper } from "../src/effect/SoftClipper.js";
import { Keyboard } from "../src/instrument/Keyboard.js";
import { Sequencer } from "../src/instrument/Sequencer.js";
import { BassDrum } from "../src/synth/808/BassDrum.js";
import { HiHat } from "../src/synth/808/HiHat.js";
import { SquareBank } from "../src/synth/808/SquareBank.js";
import { AudioOscillator } from "../src/synth/AudioOscillator.js";
import { saveWaveFile } from "../test/saveWaveFile.js";
import { saveFile } from "./saveFile.js";
import { audioBufferToWav } from "./wav.js";*/

const env = Environment.create({
	lookAhead: 0.5,
	prelude: ({ context, publicize }) => {
		const transport = Transport.create(context, {
			beatFrequency: 2,
		});

		publicize("transport", transport);
	},
});

const parameterControl = ParameterControl.create(env, {
	initialValue: 200,
	min: 100,
	max: 1000,
	title: "foo",
});

parameterControl.mount(document.body);

const parameterControl2 = ParameterControl.create(env, {
	initialValue: 200,
	min: 100,
	max: 1000,
	title: "bar",
});

parameterControl2.mount(document.body);

const patch2 = Patch.create(env);

patch2.createPort("output", { type: "message", kind: "source" });

patch2.setDefinition(({ context, getPort, global }) => {
	const transport = /** @type {Transport} */ (global.get("transport"));

	const tunner = Tunner.create({
		system: {
			type: "tet",
			tet: 12,
		},
		reference: { frequency: 440, pitch: "A4" },
	});

	/*const sequenceAa = Sequencer.create(context, {
		type: "function",
		transport,
		stepLength: 1 / 2,
		sequence: [
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("la4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("sol4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("la4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("mi4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("do4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("mi4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("la3"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			undefined,
			undefined,
		],
	});
	const sequenceASwinga = Sequencer.create(context, {
		transport,
		stepLength: 1 / 4,
		sequence: [
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("la4"),
						},
					},
				];
			},
			(step) => {
				return [
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("sol4"),
						},
					},
				];
			},
			(step) => {
				return [
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("la4"),
						},
					},
				];
			},
			(step) => {
				return [
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("mi4"),
						},
					},
				];
			},
			(step) => {
				return [
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("do4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("mi4"),
						},
					},
				];
			},
			(step) => {
				return [
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("la3"),
						},
					},
				];
			},
			(step) => {
				return [
					{
						type: "release",
						time: step.end,
					},
				];
			},
			undefined,
			undefined,
			undefined,
		],
	});
		const sequenceB = Sequencer.create(context, {
		transport,
		stepLength: 1 / 2,
		sequence: [
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("la4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("si4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("do5"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("si4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("do5"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("la4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("si4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("la4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("si4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("sol4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("la4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("sol4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("la4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("fa4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
			(step) => {
				return [
					{
						type: "attack",
						time: step.start,
						data: {
							frequency: tunner.frequencyOfPitch("la4"),
						},
					},
					{
						type: "release",
						time: step.end,
					},
				];
			},
		],
	});*/

	const sequenceA = Sequencer.create(context, {
		transport,
		tunner,
		stepLength: 1 / 2,
		sequence: "<fa4> <sol4> <la4> <re4> <do4> <mi4> <sol4> -",
	});

	const sequenceASwing = Sequencer.create(context, {
		transport,
		tunner,
		stepLength: 1 / 4,
		sequence:
			"<la4- -> <sol4- -> <la4- -> <mi4- -> <do4> <mi4- -> <la3> - - - -",
	});

	const sequenceB = Sequencer.create(context, {
		transport,
		tunner,
		stepLength: 1 / 2,
		sequence:
			"<la4> <si4> <do5> <si4> <do5> <la4> <si4> <la4> <si4> <sol4> <la4> <sol4> <la4> <fa4> <la4> -",
	});

	transport.scheduleTaskAtBeat({
		beat: 0,
		task: (beat) => {
			sequenceA.play(transport.getTimeAtBeat(beat));
		},
	});
	transport.scheduleTaskAtBeat({
		beat: 2,
		task: (beat) => {
			sequenceA.stop(transport.getTimeAtBeat(beat));
		},
	});
	transport.scheduleTaskAtBeat({
		beat: 4,
		task: (beat) => sequenceASwing.play(transport.getTimeAtBeat(beat)),
	});
	transport.scheduleTaskAtBeat({
		beat: 8,
		task: (beat) => sequenceB.play(transport.getTimeAtBeat(beat)),
	});

	//sequence1.play(transport.getTimeAtBeat(4));
	//sequence1.play(transport.getTimeAtBeat(8));

	const output = getPort({
		type: "message",
		kind: "sink",
		name: "output",
	});

	sequenceA.connectMessage(output);
	sequenceASwing.connectMessage(output);
	sequenceB.connectMessage(output);
});

const patch1 = Patch.create(env);

patch1.createPort("output", { type: "audiorate", kind: "source" });
patch1.createPort("input:message", { type: "message", kind: "sink" });
patch1.createPort("input:lowpassFrequency", {
	type: "audiorate",
	kind: "sink",
});

patch1.setDefinition(({ context, getPort }) => {
	const osc = OscillatorNode.create(context, {
		type: "square",
	});

	const lowpass = BiquadFilterNode.create(context, {
		type: "lowpass",
		frequency: 200,
	});

	osc.start(0);

	const gain = GainNode.create(context, {
		gain: 0,
	});

	const env = ADSREnvelope.create(context, {
		attack: { duration: 0.01, type: "linear" },
		decay: { duration: 0.3 },
		sustain: 0,
		release: { duration: 0.1 },
	});

	const noteSink = MessageNode.sink({
		messageListener: (note) => {
			console.log(note.time);
			if (note.type === "attack") {
				env.triggerAttack(note);
			}
			if (note.type === "note") {
				osc.frequency.setValueAtTime(note.frequency, note.time);
			}
			if (note.type === "release") {
				env.triggerRelease(note);
			}
		},
	});

	const output = getPort({
		type: "audiorate",
		kind: "sink",
		name: "output",
	});

	osc.connectAudio(lowpass);
	lowpass.connectAudio(gain);
	gain.connectAudio(output);

	env.connectAudio(gain.gain);

	const note = getPort({
		type: "message",
		kind: "source",
		name: "input:message",
	});

	note.connectMessage(noteSink);

	const lowpassFrequency = getPort({
		type: "audiorate",
		kind: "source",
		name: "input:lowpassFrequency",
	});

	lowpassFrequency.connectAudio(lowpass.frequency);
});

const inputLowPassFrequencyPort = patch1.getPort("input:lowpassFrequency");
if (inputLowPassFrequencyPort?.kind === "sink") {
	parameterControl.port.connect(inputLowPassFrequencyPort);
}

const inputNotePort = patch1.getPort("input:message");
const outputNotePort = patch2.getPort("output");
if (inputNotePort?.kind === "sink" && outputNotePort?.kind === "source") {
	outputNotePort.connect(inputNotePort);
}

const outputPort = patch1.getPort("output");
if (outputPort?.kind === "source") {
	outputPort.connect(env.destination);
}

let playing = false;
document.querySelector("#play")?.addEventListener("click", async () => {
	if (!playing) {
		playing = true;
		env.start();
	} else {
		playing = false;
		env.stop();
	}
});

document.querySelector("#render")?.addEventListener("click", async () => {
	const audioBuffer = await env.render({
		sampleRate: 48000,
		length: 10,
	});

	saveWaveFile("toto", audioBuffer);
});
