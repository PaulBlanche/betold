/** @import * as self from "./LowRateMultiply.js" */
import { LowRateNode } from "../../core/node/LowRateNode.js";

/** @type {self.LowRateMultiplyCreator} */
export const LowRateMultiply = {
	create,
};

/** @type {self.LowRateMultiplyCreator['create']} */
function create(context, config) {
	const node = LowRateNode.source(context, {
		get value() {
			return _getValueAtTime(context.currentTime);
		},
		getValueAtTime(time) {
			return _getValueAtTime(time);
		},
	});

	return node;

	/**
	 * @param {number} time
	 */
	function _getValueAtTime(time) {
		let multiply = 1;

		for (const source of config.sources) {
			multiply *= typeof source === "number" ? source : source.read(time);
		}

		return multiply;
	}
}
