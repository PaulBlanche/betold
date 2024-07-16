/** @import * as self from "./ValueTimeline.js" */
import { mixin } from "../utils/mixin.js";
import { Timeline } from "./Timeline.js";

/** @type {self.ValueTimelineCreator} */
export const ValueTimeline = {
	create,
};

/**
 * @template VALUE
 * @type {self.ValueTimelineCreator['create']} */
function create() {
	const timeline = /** @type {Timeline<self.ValueEvent<VALUE>>} */ (
		Timeline.create({
			transactional: true,
		})
	);

	/** @type {self.ValueTimeline<VALUE>} */
	const valueTimeline = mixin(timeline, {
		purge,
	});

	return /** @type {any} */ (valueTimeline);

	/** @type {self.ValueTimeline<VALUE>['purge']} */
	function purge(time) {
		const event = timeline.get({
			type: "last-before",
			value: time,
			property: "time",
			strict: true,
		});

		if (event !== undefined) {
			timeline.purgeBefore(event);
		}
	}
}
