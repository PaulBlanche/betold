/** @import * as self from "./AudioNode.js" */

/** @type {self.AudioNodeCreator} */
export const AudioNode = {
	source,
	sink,
	passthrough,
};

/** @type {self.AudioNodeCreator['source']} */
function source(config) {
	return /** @type {any}*/ (create({ source: config.source, sink: undefined }));
}

/** @type {self.AudioNodeCreator['sink']} */
function sink(config) {
	return /** @type {any}*/ (create({ sink: config.sink, source: undefined }));
}

/** @type {self.AudioNodeCreator['passthrough']} */
function passthrough(config) {
	return /** @type {any}*/ (
		create({ sink: config.sink, source: config.source })
	);
}

/** @type {self.CreateAudioNode} */
function create(config) {
	const state = {
		sink: config.sink ? resolveSink(config.sink) : undefined,
		source: config.source ? resolveSource(config.source) : undefined,
	};

	/** @type {self.AudioNode} */
	const node = {
		get sink() {
			return state.sink;
		},
		get source() {
			return state.source;
		},
		get numberOfInputs() {
			if (state.sink === undefined) {
				return 0;
			}
			if (state.sink instanceof AudioParam) {
				return 1;
			}
			return state.sink.numberOfInputs;
		},
		get numberOfOutputs() {
			if (state.source === undefined) {
				return 0;
			}
			return state.source.numberOfOutputs;
		},

		connectAudio,
		disconnectAudio,
		dispose,
	};

	return node;

	function dispose() {
		state.source?.disconnect();
		state.sink = undefined;
		state.source = undefined;
	}

	/** @type {self.AudioNode['connectAudio']}*/
	function connectAudio(destination, outputIndex, inputIndex) {
		if (state.source === undefined) {
			throw Error("can only connect nodes that are sources");
		}
		const sink = resolveSink(destination);

		if (sink instanceof globalThis.AudioNode) {
			state.source.connect(sink, outputIndex, inputIndex);
		} else {
			state.source.connect(sink, outputIndex);
		}
	}

	/** @type {self.AudioNode['disconnectAudio']}*/
	function disconnectAudio(destination, outputIndex, inputIndex) {
		if (state.source === undefined) {
			throw Error("can only disconnect nodes that are sources");
		}

		if (destination === undefined) {
			state.source.disconnect();
		} else {
			const sink = resolveSink(destination);

			if (sink instanceof globalThis.AudioNode) {
				if (outputIndex === undefined) {
					state.source.disconnect(sink);
				} else if (inputIndex === undefined) {
					state.source.disconnect(sink, outputIndex);
				} else {
					state.source.disconnect(sink, outputIndex, inputIndex);
				}
			} else {
				if (outputIndex === undefined) {
					state.source.disconnect(sink);
				} else {
					state.source.disconnect(sink, outputIndex);
				}
			}
		}
	}
}

/**
 * @param {self.ResolvableSource} node
 * @returns {AudioNode}
 */
function resolveSource(node) {
	let source = node;
	while (!(source instanceof globalThis.AudioNode)) {
		if (source === undefined || source.numberOfOutputs === 0) {
			throw new Error("Can't connect from a node with no outputs");
		}
		source = source.source;
	}

	return source;
}

/**
 * @param {self.ResolvableSink} node
 * @returns {self.ResolvedSink}
 */
function resolveSink(node) {
	/**@type {self.ResolvableSink|undefined} */
	let sink = node;
	while (
		!(sink instanceof globalThis.AudioNode || sink instanceof AudioParam)
	) {
		if (
			sink === undefined ||
			(sink instanceof globalThis.AudioNode && sink.numberOfInputs === 0)
		) {
			throw new Error("Can't connect to a node with no inputs");
		}

		sink = "sink" in sink ? sink.sink : undefined;
	}

	return sink;
}
