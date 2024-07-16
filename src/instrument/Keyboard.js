/** @import * as self from "./Keyboard.js" */
import {
	html,
	render,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import { MessageNode } from "../core/node/MessageNode.js";
import { mixin } from "../utils/mixin.js";

/** @type {self.KeyboardCreator} */
export const Keyboard = {
	create,
};

/** @type {self.KeyboardCreator['create']} */
export function create(context, config) {
	_init();

	const noteSource = MessageNode.source();

	return mixin(noteSource, { dispose });

	function dispose() {
		noteSource.disconnectMessage();
	}

	function _init() {
		const root = document.createElement("div");
		document.body.appendChild(root);

		render(
			html`
				<${Keyboard12} 
					from=${3} 
					onAttack=${_onAttack} 
					onRelease=${_onRelease} 
				/>
			`,
			root,
		);
	}

	/**
	 * @param {import("../core/tunner/Pitch.js").Pitch} pitch
	 */
	function _onAttack(pitch) {
		noteSource.messageEmitter.emit({
			type: "attack",
			time: context.now,
			data: {
				frequency: config.tunner.frequencyOfPitch(pitch),
				velocity: 128,
			},
		});
	}

	function _onRelease() {
		noteSource.messageEmitter.emit({
			type: "release",
			time: context.now,
		});
	}
}

const SCALE_12 = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B",
];

/**
 * @param {{
 * 		from: import("../core/tunner/Pitch.js").Octave
 * 		onAttack: (pitch: import("../core/tunner/Pitch.js").Pitch) => void
 * 		onRelease: () => void
 * }} props
 * @returns
 */
function Keyboard12(props) {
	return html`
		<div class="keyboard instrument">
			${Array.from({ length: 2 }).map((_, i) => {
				return html`
					<div class="octave">${SCALE_12.map((scalePitch) => {
						const octave = props.from + i;
						return html`
							<${Key} 
								pitch="${`${scalePitch}${octave}`}" 
								onAttack="${props.onAttack}" 
								onRelease="${props.onRelease}"
								type=${scalePitch.length === 1 ? "white" : "black"}
							/>
						`;
					})}
					</div>
				`;
			})}
		</div>
	`;
}

/**
 * @param {{
 * 		type: 'black'|'white'
 * 		pitch: import("../core/tunner/Pitch.js").Pitch,
 * 		onAttack: (pitch: import("../core/tunner/Pitch.js").Pitch) => void
 * 		onRelease: () => void
 * }} props
 */
function Key(props) {
	return html`
		<button 
			class="key ${props.type}"
			onMouseDown="${
				/** @param {MouseEvent} event */
				(event) => {
					if (
						event.altKey ||
						event.shiftKey ||
						event.ctrlKey ||
						event.metaKey
					) {
						return;
					}
					if (event.buttons === 1) {
						props.onAttack(props.pitch);
					}
				}
			}"
			onMouseUp="${props.onRelease}"
		>
			<span class="label">${props.pitch}</span>
		</button>
	`;
}
