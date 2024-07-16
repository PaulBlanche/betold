/** @import * as self from "./Ref.js" */

/** @type {self.RefCreator} */
export const Ref = {
	create,
};

/** @type {self.CreatePrivateRef} */
export function create() {
	const state = {
		/** @type {HTMLElement|undefined} */
		node: undefined,
	};

	/** @type {self.PrivateRef} */
	const self = {
		get node() {
			if (state.node === undefined) {
				throw Error("no node found");
			}
			return state.node;
		},
		dispose() {
			if (state.node !== undefined) {
				state.node.remove();
				state.node = undefined;
			}
		},
		setNode(node) {
			state.node = node;
		},
	};

	return /** @type {any}*/ (self);
}

/** @type {self.isRef} */
export function isRef(value) {
	return (
		typeof value === "object" &&
		value !== null &&
		"setNode" in value &&
		"node" in value
	);
}
