import type { BaseContext } from "../../core/BaseContext";
import type { AudioNode } from "../../core/node/AudioNode";
import type { DisposableNode } from "../../core/node/DisposableNode";

interface SquareBank extends DisposableNode {
	readonly oscillators: ReadonlyArray<AudioNode>;
}

interface SquareBankCreator {
	create(context: BaseContext): SquareBank;
}

export let SquareBank: SquareBankCreator;
