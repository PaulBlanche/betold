import { sendMouse } from "@web/test-runner-commands";
import { OfflineContext } from "../src/core/OfflineContext.js";
import { OnlineContext } from "../src/core/OnlineContext.js";

/**
 * @param {import("../src/core/OnlineContext.js").OnlineContextConfig} config
 * @param {(context: OnlineContext) => Promise<void>} callback
 */
export async function withContext(config, callback) {
	await sendMouse({
		type: "click",
		position: [0, 0],
	});

	const context = OnlineContext.create(config);

	try {
		await callback(context);
	} finally {
		context.close();
	}
}

/**
 * @param {import("../src/core/OfflineContext.js").OfflineContextConfig} config
 * @param {(context: OfflineContext) => Promise<void>} callback
 */
export async function withOfflineContext(config, callback) {
	await sendMouse({
		type: "click",
		position: [0, 0],
	});

	const context = OfflineContext.create(config);

	await callback(context);
}
