/** @import * as self from "./Patch.js";*/
/** @import { BaseContext } from "../../core/BaseContext.js";*/
/** @import { SinkPort, SourcePort } from "./Port.js";*/
import { Port } from "./Port.js";

/** @type {self.PatchCreator} */
export const Patch = {
	create,
};

/** @type {self.PatchCreator['create']} */
function create(environment) {
	const state = {
		/** @type {BaseContext|undefined} */
		context: undefined,
		/** @type {self.PatchDefinition} */
		definition: () => {},
		/** @type {Map<string, SinkPort|SourcePort>} */
		ports: new Map(),
	};

	/** @type {self.Patch} */
	const self = {
		setDefinition,
		createPort,
		getPort,
		removePort,

		setContext,
		apply,
		unsetContext,
		dispose,
	};

	environment.register(self);

	return self;

	function dispose() {
		for (const port of state.ports.values()) {
			port.dispose();
		}

		environment.deregister(self);
	}

	/** @type {self.Patch['getPort']} */
	function getPort(name) {
		const port = state.ports.get(name);

		if (port === undefined) {
			throw Error(`Port ${name} not found`);
		}

		return port;
	}

	/** @type {self.Patch['setDefinition']} */
	function setDefinition(definition) {
		state.definition = definition;
	}

	/** @type {self.Patch['createPort']} */
	function createPort(name, portConfig) {
		state.ports.set(
			name,
			portConfig.kind === "sink"
				? Port.sink(environment, {
						type: portConfig.type,
					})
				: Port.source(environment, {
						type: portConfig.type,
					}),
		);
	}

	/** @type {self.Patch['removePort']} */
	function removePort(name) {
		state.ports.delete(name);
	}

	/** @type {self.Patch['setContext']} */
	function setContext(context) {
		state.context = context;
	}

	/** @type {self.Patch['apply']} */
	function apply(global) {
		if (state.context === undefined) {
			return;
		}

		state.definition({
			global,
			context: state.context,
			getPort: _getPort,
		});
	}

	/** @type {self.Patch['unsetContext']} */
	function unsetContext() {
		state.context = undefined;
	}

	/** @type {self.GetPort} */
	function _getPort(query) {
		const port = state.ports.get(query.name);
		if (
			port === undefined ||
			port.kind === query.kind ||
			port.portNode.type !== query.type
		) {
			throw Error(`Port ${query.name} (${query.type}:${query.kind}) not found`);
		}

		const node = port.portNode.node;

		if (node === undefined) {
			throw Error("Context was not applied correctly");
		}

		return /** @type {any}*/ (node);
	}
}
