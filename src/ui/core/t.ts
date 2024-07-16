import type { BaseContext } from "../../core/BaseContext";

type PortKind = "source" | "sink";
type ConnectionType = "audiorate" | "lowrate" | "note";

interface Port<KIND extends PortKind, TYPE extends ConnectionType> {
	readonly name: string;
	readonly type: TYPE;
	readonly kind: KIND;

	apply(context: BaseContext): void;
}

type LinkConfig<TYPE extends ConnectionType> = {
	source: Port<"source", TYPE>;
	sink: Port<"sink", TYPE>;
};

interface Link<TYPE extends ConnectionType> {
	source: Port<"source", TYPE>;
	sink: Port<"sink", TYPE>;

	apply(context: BaseContext): void;
	dispose(): void;
}
