import type { EventEmitter } from "../../utils/EventEmitter.js";
import type { DisposableNode } from "./DisposableNode.js";

// biome-ignore lint/suspicious/noEmptyInterface: interface can be extended
interface Messages {}

export type BaseMessage = Messages[keyof Messages];
export type Message = BaseMessage & { time: number };

export interface MessageSource extends DisposableNode {
	readonly messageEmitter: EventEmitter<Message>;

	connectMessage(destination: MessageSink): void;
	disconnectMessage(destination?: MessageSink): void;
}

export interface MessageSink extends DisposableNode {
	messageListener(message: Message): void;
}

export interface MessagePassThrough extends MessageSink, MessageSource {}

export interface MessageNode {
	readonly messageEmitter?: EventEmitter<Message>;
	messageListener?(message: Message): void;
	dispose(): void;

	connectMessage(destination: MessageSink): void;
	disconnectMessage(destination?: MessageSink): void;
}

export type MessageSinkConfig = {
	messageListener(message: Message): void;
};

export type MessagePassThroughConfig = Partial<MessageSinkConfig>;

export type MessageNodeConfig = Partial<MessageSinkConfig>;

type CreateMessageNode = (config: MessageNodeConfig) => MessageNode;

interface MessageNodeCreator {
	passthrough(config?: MessagePassThroughConfig): MessagePassThrough;
	sink(config: MessageSinkConfig): MessageSink;
	source(): MessageSource;
}

export let MessageNode: MessageNodeCreator;
