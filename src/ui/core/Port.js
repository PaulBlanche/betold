/** @import * as self from "./Port.js" */

import { GainNode } from "../../core/GainNode.js";
import { AudioNode } from "../../core/node/AudioNode.js";
import { LowRateNode } from "../../core/node/LowRateNode.js";
import { MessageNode } from "../../core/node/MessageNode.js";
import { BaseParam } from "../../core/param/BaseParam.js";
import { mixin } from "../../utils/mixin.js";

/**@type {self.PortCreator} */
export const Port = {
	sink,
	source,
};

/**@type {self.PortCreator['sink']} */
function sink(environment, config) {
	return create(environment, { ...config, kind: "sink" });
}

/**@type {self.PortCreator['source']} */
function source(environment, config) {
	return create(environment, { ...config, kind: "source" });
}

/**
 * @type {self.CreatePort} */
function create(environment, config) {
	/** @type {self.SinkPort[]} */
	const sinks = [];

	const state = {
		/** @type{self.Port['portNode']['node']} */
		node: undefined,
	};

	/** @type {self.Port} */
	const self = {
		get portNode() {
			return /** @type {any} */ ({
				node: state.node,
				type: config.type,
			});
		},
		get sinks() {
			return sinks;
		},
		get kind() {
			return config.kind;
		},

		canConnect,
		connect,
		disconnect,

		setContext,
		unsetContext,
		apply,
		dispose,
	};

	environment.register(self);

	return /** @type {any} */ (self);

	function dispose() {
		environment.deregister(self);
	}

	/** @type {self.Port['unsetContext']} */
	function unsetContext() {
		console.log("unset");
		state.node = undefined;
	}

	/** @type {self.Port['canConnect']} */
	function canConnect(destination) {
		return (
			destination.kind !== self.kind &&
			destination.portNode.type === self.portNode.type
		);
	}

	/** @type {self.Port['setContext']} */
	function setContext(context) {
		if (state.node === undefined) {
			switch (config.type) {
				case "audiorate": {
					const gain = GainNode.create(context, { gain: 1 });
					state.node = AudioNode.passthrough({
						sink: gain,
						source: gain,
					});
					break;
				}
				case "lowrate": {
					const param = BaseParam.create(context, { defaultValue: 0 });
					state.node = LowRateNode.passthrough(context, param);
					break;
				}
				case "message": {
					state.node = MessageNode.passthrough();
					break;
				}
			}
		}
	}

	/** @type {self.Port['apply']} */
	function apply() {
		for (const sink of sinks) {
			if (self.portNode.node && sink.portNode.node) {
				if (
					self.portNode.type === "audiorate" &&
					sink.portNode.type === "audiorate"
				) {
					self.portNode.node.connectAudio(sink.portNode.node);
				}

				if (
					self.portNode.type === "lowrate" &&
					sink.portNode.type === "lowrate"
				) {
					self.portNode.node.connectLowRate(sink.portNode.node);
				}

				if (
					self.portNode.type === "message" &&
					sink.portNode.type === "message"
				) {
					self.portNode.node.connectMessage(sink.portNode.node);
				}
			}
		}
	}

	/** @type {self.Port['connect']} */
	function connect(destination) {
		if (!canConnect(destination)) {
			throw Error(
				`Can't conect port "${self.kind}:${self.portNode.type}" to "${destination.kind}:${destination.portNode.type}"`,
			);
		}

		sinks.push(destination);
	}

	/** @type {self.Port['disconnect']} */
	function disconnect(destination) {
		const sinkIndex = sinks.indexOf(destination);
		if (sinkIndex !== -1) {
			sinks.splice(sinkIndex, 1);
		}
	}
}
