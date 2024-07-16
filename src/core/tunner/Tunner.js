/** @import * as self from "./Tunner.js" */
import { PythagoreanTunner } from "./PythagoreanTunner.js";
import { TetTunner } from "./TetTunner.js";

/** @type {self.TunnerCreator} */
export const Tunner = {
	create,
};

/** @type {self.TunnerCreator['create']} */
function create(config) {
	const system = config.system ?? { type: "tet" };
	const reference = config.reference ?? { pitch: "A4", frequency: 440 };

	if (system.type === "tet") {
		return TetTunner.create({
			tet: system.tet ?? 12,
			reference,
		});
	}

	return PythagoreanTunner.create({
		reference,
	});
}
