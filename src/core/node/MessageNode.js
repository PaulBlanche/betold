/** @import * as self from "./MessageNode.js" */
import { EventEmitter } from "../../utils/EventEmitter.js";

/** @type {self.MessageNodeCreator} */
export const MessageNode = {
	source,
	sink,
	passthrough,
};

/** @type {self.MessageNodeCreator['source']} */
function source() {
	return /** @type {any}*/ (create({}));
}

/** @type {self.MessageNodeCreator['sink']} */
function sink(config) {
	return /** @type {any}*/ (create(config));
}

/** @type {self.MessageNodeCreator['passthrough']} */
function passthrough(config = {}) {
	const node = /** @type {self.MessagePassThrough}*/ (
		create({
			messageListener:
				config.messageListener ??
				((message) => {
					node.messageEmitter.emit(message);
				}),
		})
	);

	return node;
}

/** @type {self.CreateMessageNode} */
function create(config) {
	/** @type {EventEmitter<self.Message>} */
	const eventEmitter = EventEmitter.create();

	/** @type {(() => void)[]} */
	const disconnects = [];

	/** @type {self.MessageNode} */
	const node = {
		messageEmitter: eventEmitter,
		messageListener: config.messageListener,
		dispose,

		connectMessage,
		disconnectMessage,
	};

	return node;

	function dispose() {
		for (const disconnect of disconnects) {
			disconnect();
		}
	}

	/** @type {self.MessageNode['connectMessage']}*/
	function connectMessage(destination) {
		const messageEmitter = node.messageEmitter;
		if (messageEmitter === undefined) {
			return;
		}

		messageEmitter.addEventListener(destination.messageListener);
		disconnects.push(() =>
			messageEmitter.removeEventListener(destination.messageListener),
		);
	}

	/** @type {self.MessageNode['disconnectMessage']}*/
	function disconnectMessage(destination) {
		if (node.messageEmitter === undefined) {
			return;
		}

		if (destination === undefined) {
			node.messageEmitter.removeAllEventListener();
		}
		if (destination !== undefined) {
			node.messageEmitter.removeEventListener(destination.messageListener);
		}
	}
}
