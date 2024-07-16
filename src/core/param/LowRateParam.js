/** @import * as self from "./LowRateParam.js" */
import { mixin, omit } from "../../utils/mixin.js";
import { LowRateNode } from "../node/LowRateNode.js";
import { BaseParam } from "./BaseParam.js";

/** @type {self.LowRateParamCreator} */
export const LowRateParam = {
	create,
};

/** @type {self.LowRateParamCreator['create']} */
function create(context, config) {
	const baseParam = BaseParam.create(context, config);

	const node = LowRateNode.passthrough(context, baseParam);

	return mixin(omit(baseParam, ["dispose"]), omit(node, ["dispose"]), {
		dispose,
	});

	function dispose() {
		node.dispose();
		baseParam.dispose();
	}
}
