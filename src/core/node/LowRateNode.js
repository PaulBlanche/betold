/** @import * as self from "./LowRateNode" */
import { mixin } from "../../utils/mixin.js";

/** @type {self.LowRateNodeCreator} */
export const LowRateNode = {
	source,
	sink,
	passthrough,
};

/** @type {self.LowRateNodeCreator['source']} */
function source(context, param) {
	return create(context, param);
}

/** @type {self.LowRateNodeCreator['sink']} */
function sink(context, param) {
	return create(context, param);
}

/** @type {self.LowRateNodeCreator['passthrough']} */
function passthrough(context, param) {
	return create(context, param);
}

/** @type {self.CreateLowRateNode} */
function create(context, param) {
	/** @type {(self.LowRateNode)[]} */
	const sources = [];
	/** @type {self.LowRateSink[]} */
	const sinks = [];

	/** @type {self.LowRateNode} */
	const self = mixin(param, {
		get sources() {
			return sources;
		},
		get sinks() {
			return sinks;
		},

		read,
		dispose,
		connectLowRate,
		disconnectLowRate,
	});

	return self;

	/** @type {self.LowRateNode['read']} */
	function read(dirtyTime = context.currentTime) {
		const time = Math.max(context.currentTime, dirtyTime);

		return sources.reduce((value, source) => {
			return value + source.read(time);
		}, param.getValueAtTime(time));
	}

	/** @type {self.LowRateNode['connectLowRate']} */
	function connectLowRate(destination) {
		destination.sources.push(self);
		sinks.push(destination);
	}

	/** @type {self.LowRateNode["disconnectLowRate"]} */
	function disconnectLowRate(destination) {
		if (destination === undefined) {
			// remove ourselves from the sources of each of our sinks
			for (const sink of sinks) {
				const sourceIndex = sink.sources.indexOf(self);
				if (sourceIndex !== -1) {
					sink.sources.splice(sourceIndex, 1);
				}
			}
			// remove all sinks
			sinks.length = 0;
		} else {
			// remove ourselves from the sources of destination
			const sourceIndex = destination.sources.indexOf(self);
			if (sourceIndex !== -1) {
				destination.sources.splice(sourceIndex, 1);
			}
			// remove destination from our sinks
			const sinkIndex = sinks.indexOf(destination);
			if (sinkIndex !== -1) {
				sinks.splice(sinkIndex, 1);
			}
		}
	}

	function dispose() {
		disconnectLowRate();

		// remove ourselves from the sinks of each of our sources
		for (const source of self.sources) {
			const sinkIndex = source.sinks.indexOf(self);
			if (sinkIndex !== -1) {
				source.sinks.splice(sinkIndex, 1);
			}
		}
		self.sources.length = 0;
	}
}
