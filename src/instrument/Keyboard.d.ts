import type { BaseContext } from "../core/BaseContext";
import type { DisposableNode } from "../core/node/DisposableNode";
import type { NoteSource } from "../core/node/MessageNode";
import type { Octave } from "../core/tunner/Pitch";
import type { Tunner } from "../core/tunner/Tunner";

type KeyboardConfig = {
	tunner: Tunner;
};

interface Keyboard extends NoteSource, DisposableNode {}

interface KeyboardCreator {
	create(context: BaseContext, config: KeyboardConfig): Keyboard;
}

export let Keyboard: KeyboardCreator;

type KeyboardProps = {
	layout: "12" | "19" | "24" | "31";
	range: [Octave, Octave];
};

type Keyboard12Props = {
	range: [Octave, Octave];
};

type Keyboard12 = (props: Keyboard12Props) => preact.ComponentChildren;
