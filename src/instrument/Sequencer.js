/** @import * as self from "./Sequencer.js" */
/** @import { Tunner } from "../core/tunner/Tunner.js" */
/** @import { Pitch } from "../core/tunner/Pitch.js" */
import { MessageNode } from "../core/node/MessageNode.js";
import { mixin } from "../utils/mixin.js";

/** @type {self.SequencerCreator} */
export const Sequencer = {
	create,
};

/** @type {self.SequencerCreator['create']} */
function create(context, config) {
	const noteSource = MessageNode.source();

	const state = {
		stepLength: config.stepLength,
		tunner: config.tunner,
		transport: config.transport,
		sequence: _sequence(config.sequence, config.tunner),
	};

	/** @type {{ id:number, beat:number}[]} */
	const tasks = [];

	return mixin(noteSource, {
		get sequence() {
			return state.sequence;
		},
		set sequence(sequence) {
			state.sequence = _sequence(sequence, state.tunner);
		},
		get transport() {
			return state.transport;
		},
		set transport(transport) {
			state.transport = transport;
		},
		get tunner() {
			return state.tunner;
		},
		set tunner(tunner) {
			state.tunner = tunner;
		},
		get stepLength() {
			return state.stepLength;
		},
		set stepLength(stepLength) {
			state.stepLength = stepLength;
		},

		play,
		stop,
	});

	/**
	 * @param {(self.FunctionSequence | null | undefined)[] | self.ArraySequence | string} sequence
	 * @param {Tunner=} tunner
	 * @returns {(self.FunctionSequence | null | undefined)[] | self.ArraySequence}
	 */
	function _sequence(sequence, tunner) {
		if (typeof sequence === "string") {
			if (tunner === undefined) {
				throw Error("Tunner needed");
			}
			return _parseSequence(sequence, tunner);
		}

		return sequence;
	}

	/** @type {self.Sequencer['play']} */
	function stop(dirtyTime = context.currentTime) {
		const time = Math.max(context._audioContext.currentTime, dirtyTime);

		const beatAtStopTime = state.transport.getBeatAtTime(time);

		for (const { id, beat } of tasks) {
			if (beat >= beatAtStopTime) {
				state.transport.cancelTask(id);
			}
		}
	}

	/** @type {self.Sequencer['play']} */
	function play(dirtyTime = context.currentTime) {
		const time = Math.max(context._audioContext.currentTime, dirtyTime);

		for (const [index, step] of state.sequence.entries()) {
			if (step === undefined || step === null) {
				continue;
			}

			const beat =
				state.transport.getBeatAtTime(time) + state.stepLength * index;

			const taskId = state.transport.scheduleTaskAtBeat({
				beat,
				task: () => {
					console.log("run", taskId);
					const start = state.transport.getTimeAtBeat(beat);
					const end = state.transport.getTimeAtBeat(beat + state.stepLength);

					let messages;
					if (typeof step === "function") {
						messages = step(
							{ start, end },
							{
								timeNStepFromNow(n) {
									return state.transport.getTimeAtBeat(
										beat + n * state.stepLength,
									);
								},
							},
						);
					} else if (Array.isArray(step)) {
						messages = step.map((message) => {
							return {
								...message,
								time: message.type === "release" ? end : start,
							};
						});
					} else {
						messages = {
							...step,
							time: step.type === "release" ? end : start,
						};
					}

					if (messages === undefined || messages === null) {
						return;
					}

					if (Array.isArray(messages)) {
						for (const message of messages) {
							noteSource.messageEmitter.emit(message);
						}
					} else {
						noteSource.messageEmitter.emit(messages);
					}
				},
			});

			tasks.push({ id: taskId, beat });
		}
	}
}

// [["toto","toto2", "toto3"], ["tata", "tata2", "tata3"]]

/**
 * @param {string} sequence
 * @param {Tunner} tunner
 */
function _parseSequence(sequence, tunner) {
	const lines = sequence.split("\n\n");
	let partNumber = 0;

	/** @type {self.SequencerMessage[][][]} */
	const messages = [];

	for (const [lineIndex, line] of lines.entries()) {
		const parts = line.split("\n");
		if (partNumber === 0) {
			partNumber = parts.length;
		}
		if (partNumber !== parts.length) {
			throw Error(
				`Found ${parts.length} parts instead of ${partNumber} on line ${lineIndex}`,
			);
		}

		for (const [voice, part] of parts.entries()) {
			messages[voice] = messages[voice] || [];

			messages[voice].push(..._parsePart(part, voice, tunner));
		}
	}

	/** @type {self.SequencerMessage[][]} */
	const combinedMessages = [];
	for (const part of messages) {
		for (const [index, step] of part.entries()) {
			combinedMessages[index] = combinedMessages[index] || [];
			combinedMessages[index].push(...step);
		}
	}

	return combinedMessages;
}

// <la#4{vel:150;por:12;pan:-50}- ----- - -> <fa4-> <do5 ---->
// ------------------------------ <mi3- - -> ------ ---- <re6>
//
// <mi6-->
// <sib4->

/**
 * @param {string} part
 * @param {number} voice
 * @param {Tunner} tunner
 */
function _parsePart(part, voice, tunner) {
	const stringSteps = part.split(" ");
	/** @type {self.SequencerMessage[][]} */
	const sequence = [];
	for (let step of stringSteps) {
		/** @type {self.SequencerMessage[]} */
		const messages = [];
		if (step.startsWith("<")) {
			step = step.slice(1);
			messages.push({ type: "attack", voice });
		}
		if (step.endsWith(">")) {
			step = step.slice(0, -1);
			messages.push({ type: "release", voice });
		}
		step = step.replace(/-/g, "");
		if (step.length !== 0) {
			const i = step.indexOf("{");
			if (i === -1) {
				const pitch = /** @type {Pitch} */ (step);
				messages.push({
					type: "note",
					voice,
					frequency: tunner.frequencyOfPitch(pitch),
				});
			} else {
				const pitch = /** @type {Pitch} */ (step.slice(0, i));
				const data = JSON.parse(step.slice(i));
				messages.push({
					type: "note",
					voice,
					frequency: tunner.frequencyOfPitch(pitch),
					velocity: data.vel,
					portamento: data.por,
					pan: data.pan,
				});
			}
		}

		sequence.push(messages);
	}

	return sequence;
}
