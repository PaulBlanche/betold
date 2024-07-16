/** @import * as self from "./dom.js" */

import { isRef } from "./Ref.js";

/** @type {self.tag} */
export function tag(component, props) {
	return ({ children }) => component({ ...props, children });
}

/** @type {WeakMap<TemplateStringsArray, self.CompiledRoot>} */
const TEMPLATE_CACHE = new WeakMap();

/** @type {self.render} */
export function render(statics, ...dynamics) {
	if (!TEMPLATE_CACHE.has(statics)) {
		TEMPLATE_CACHE.set(statics, compile(statics));
	}

	const compiled = TEMPLATE_CACHE.get(statics);
	if (compiled === undefined) {
		throw Error("[internal]: template not found in cache");
	}

	return toFragment(compiled, dynamics);
}

/** @type {self.fragment} */
export function fragment(compiled, dynamics) {
	const renderable = /** @type {self.Renderable} */ (
		() => render(compiled, dynamics)
	);

	renderable.$$renderable$$ = true;

	return renderable;
}

/** @type {self.toFragment} */
export function toFragment(compiled, dynamics) {
	const resultFragment = document.createDocumentFragment();
	/** @type {({ compiledNode:self.CompiledNode, node:Node})[]} */
	const path = [{ compiledNode: compiled, node: resultFragment }];
	/** @type {{ compiledNode:self.CompiledNode, node:Node}} */
	let currentPathEntry = path[0];

	/** @type {self.CompiledChild[]} */
	const stack = compiled.children.toReversed();
	/** @type {self.CompiledChild|undefined} */
	let currentCompiledNode = undefined;

	// biome-ignore lint/suspicious/noAssignInExpressions: iterate over stack
	while ((currentCompiledNode = stack.pop()) !== undefined) {
		if (typeof currentCompiledNode === "string") {
			const textNode = document.createTextNode(currentCompiledNode);
			currentPathEntry.node.appendChild(textNode);

			continue;
		}

		if ("dyn" in currentCompiledNode) {
			const interpolation = dynamics[currentCompiledNode.dyn];
			if (interpolation instanceof DocumentFragment) {
				currentPathEntry.node.appendChild(interpolation);
			} else if (isRenderable(interpolation)) {
				currentPathEntry.node.appendChild(interpolation());
			} else if (
				typeof interpolation !== "boolean" &&
				interpolation !== null &&
				interpolation !== undefined
			) {
				const textNode = document.createTextNode(String(interpolation));
				currentPathEntry.node.appendChild(textNode);
			}
			continue;
		}

		if (currentCompiledNode.name === undefined) {
			throw Error("[internal]: got a compiled node with no name");
		}

		/** @type {unknown} */
		let name;
		if (isInterpolation(currentCompiledNode.name)) {
			name = dynamics[currentCompiledNode.name.dyn];
		} else {
			name = currentCompiledNode.name;
		}

		if (typeof name !== "function" && typeof name !== "string") {
			throw Error("Tagnames can only be strings or Components");
		}

		ID_COUNTER += 1;

		const props = _getProps(currentCompiledNode, dynamics);

		if (typeof name === "string") {
			if (
				"node" in currentPathEntry &&
				currentPathEntry.compiledNode === currentCompiledNode
			) {
				path.pop();
				currentPathEntry = path[path.length - 1];
			} else {
				if (name === "!--") {
					continue;
				}
				const element = _createElement(name);

				for (const [name, value] of Object.entries(props)) {
					_setAttribute(element, name, value);
				}

				currentPathEntry.node.appendChild(element);

				const pathEntry = {
					compiledNode: currentCompiledNode,
					node: element,
				};
				path.push(pathEntry);
				currentPathEntry = pathEntry;
				stack.push(currentCompiledNode);

				if (currentCompiledNode.children) {
					for (let i = currentCompiledNode.children.length - 1; i >= 0; i--) {
						stack.push(currentCompiledNode.children[i]);
					}
				}
			}
		} else {
			const compiledChild = currentCompiledNode.children;
			const children = /** @type {self.Renderable} */ (
				() => toFragment({ children: compiledChild ?? [] }, dynamics)
			);
			children.$$renderable$$ = true;

			const result = /** @type {self.Component} */ (name)({
				...props,
				children,
			});

			if (result instanceof DocumentFragment) {
				currentPathEntry.node.appendChild(result);
			} else if (isRenderable(result)) {
				currentPathEntry.node.appendChild(result());
			} else if (
				typeof result !== "boolean" &&
				result !== null &&
				result !== undefined
			) {
				const textNode = document.createTextNode(String(result));
				currentPathEntry.node.appendChild(textNode);
			}
		}
	}

	return resultFragment;
}

let ID_COUNTER = 0;

/** @type {self.useId} */
export function useId(prefix) {
	const id = ID_COUNTER.toString(36);

	if (prefix) {
		return `${prefix}-${id}`;
	}

	return id;
}

/** @type {WeakMap<self.Context, unknown[]>} */
const CONTEXTS = new WeakMap();

/** @type {self.createContext} */
export function createContext(defaultValue) {
	/** @type {self.Context} */
	const context = {
		Provider: (props) => {
			if (!CONTEXTS.has(context)) {
				CONTEXTS.set(context, []);
			}
			CONTEXTS.get(context)?.push(props.value);

			const fragment = toFragment({ children: [{ dyn: 0 }] }, [props.children]);

			CONTEXTS.get(context)?.pop();

			return fragment;
		},
	};

	if (defaultValue !== undefined) {
		CONTEXTS.set(context, [defaultValue]);
	}

	return context;
}

/**
 * @param {self.Context} context
 * @returns {unknown}
 */
export function useContext(context) {
	const values = CONTEXTS.get(context);
	if (values === undefined) {
		throw Error("Context has no value");
	}
	return values[values.length - 1];
}

const WHITESPACES = [" ", "\n", "\t", "\r"];

/** @type {self.compile} */
export function compile(statics) {
	let context = "text";
	let buffer = "";
	let quote = "";

	/** @type {self.CompiledRoot} */
	const result = { children: [] };
	/** @type {self.CompiledNode[]} */
	const path = [result];
	/** @type {self.CompiledNode} */
	let current = result;

	for (let i = 0; i < statics.length; i++) {
		if (i > 0) {
			parse(i - 1, undefined);
		}

		for (let j = 0; j < statics[i].length; j++) {
			parse(i, j);
		}
	}
	commit();

	return result;

	/**
	 * @param {number} i
	 * @param {number=} j
	 */
	function parse(i, j) {
		switch (context) {
			case "text": {
				if (j === undefined) {
					commit(i);
				} else {
					const char = statics[i][j];

					if (char === "<") {
						if (statics[i][j + 1] === "/") {
							commit();
							context = "close-tag";
						} else {
							commit();
							opentTag();
							context = "open-tag";
						}
					} else {
						buffer += char;
					}
				}
				break;
			}
			case "close-tag": {
				if (j !== undefined && statics[i][j] === ">") {
					closeTag();
					context = "text";
				}
				break;
			}
			case "open-tag": {
				if (j === undefined) {
					commit(i);
					context = "attributes";
				} else {
					const char = statics[i][j];

					if (char === "-" && buffer === "!-") {
						current.name = "!--";
						context = "comment";
						buffer = "";
					} else if (WHITESPACES.includes(char)) {
						commit();
						context = "attributes";
					} else if (char === "/") {
						commit();
						context = "slash";
					} else if (char === ">") {
						commit();
						context = "text";
					} else {
						buffer += char;
					}
				}
				break;
			}
			case "slash": {
				if (j !== undefined && statics[i][j] === ">") {
					closeTag();
					context = "text";
				}
				break;
			}
			case "attributes": {
				if (j === undefined) {
					throw Error("Attribute names must be static");
				}
				const char = statics[i][j];
				if (char === "/") {
					context = "slash";
				} else if (char === ">") {
					context = "text";
				} else if (!WHITESPACES.includes(char)) {
					buffer += char;
					context = "attribute-name";
				}
				break;
			}
			case "attribute-name": {
				if (j === undefined) {
					if (buffer !== "...") {
						throw Error("Attribute names must be fully static");
					}
					context = "attribute-spread";
					commit(i);
					context = "attributes";
				} else {
					const char = statics[i][j];
					if (char === "=") {
						commit();
						context = "attribute-value";
					} else if (char === "/") {
						commit();
						context = "boolean-attribute-value";
						commit();
						context = "slash";
					} else if (char === ">") {
						commit();
						context = "boolean-attribute-value";
						commit();
						context = "text";
					} else if (WHITESPACES.includes(char)) {
						commit();
						context = "boolean-attribute-value";
						commit();
						context = "attributes";
					} else {
						buffer += char;
					}
				}
				break;
			}
			case "attribute-value": {
				if (j === undefined) {
					commit(i);
					context = "attributes";
				} else {
					const char = statics[i][j];
					if (buffer.length === 0 && (char === "'" || char === '"')) {
						quote = char;
						context = "quoted-attribute-value";
					} else if (char === "/") {
						commit();
						context = "slash";
					} else if (char === ">") {
						commit();
						context = "text";
					} else if (WHITESPACES.includes(char)) {
						commit();
						context = "attributes";
					} else {
						buffer += char;
					}
				}
				break;
			}
			case "quoted-attribute-value": {
				if (j === undefined) {
					commit(i);
				} else {
					const char = statics[i][j];
					if (char === quote) {
						quote = "";
						commit();
						context = "attributes";
					} else {
						buffer += char;
					}
				}
				break;
			}
			case "comment": {
				if (j === undefined) {
					commit(i);
				} else {
					const char = statics[i][j];
					if (char === ">" && buffer.endsWith("--")) {
						buffer = buffer.slice(0, -2);
						commit();
						closeTag();
						context = "text";
					} else {
						buffer += char;
					}
				}
			}
		}
	}

	/**
	 * @param {number=} dyn
	 */
	function commit(dyn) {
		switch (context) {
			case "text": {
				if (buffer.length > 0) {
					current.children = current.children ?? [];
					current.children.push(
						buffer.replace(/^\s*\n\s*|\s*\n\s*$/g, "").replace(/\s+/, " "),
					);
					buffer = "";
				}
				if (dyn !== undefined) {
					current.children = current.children ?? [];
					current.children.push({ dyn });
				}
				break;
			}
			case "open-tag": {
				if (dyn !== undefined) {
					if (buffer.length > 0) {
						throw Error("Tag name must either be fully static or dynamic");
					}
					current.name = { dyn };
				} else {
					current.name = buffer;
					buffer = "";
				}
				break;
			}
			case "attribute-spread": {
				if (dyn === undefined) {
					throw Error("[internal]: never commit non dyn in attribute-spread");
				}
				current.attributes = current.attributes ?? [];
				current.attributes.push({ dyn });
				buffer = "";
				break;
			}
			case "attribute-name": {
				current.attributes = current.attributes ?? [];
				current.attributes.push({ name: buffer });
				buffer = "";
				break;
			}
			case "attribute-value": {
				if (dyn !== undefined) {
					current.attributes = current.attributes ?? [];
					const attribute = current.attributes[current.attributes.length - 1];
					if (buffer.length > 0) {
						throw Error(
							"Unquoted attributes mus either be fully static or dynamic",
						);
					}
					if ("dyn" in attribute) {
						throw Error("[internal]: can't affect value to a spread attribute");
					}
					attribute.value = { dyn };
				} else {
					current.attributes = current.attributes ?? [];
					const attribute = current.attributes[current.attributes.length - 1];

					if ("dyn" in attribute) {
						throw Error("[internal]: can't affect value to a spread attribute");
					}

					attribute.value = buffer;
					buffer = "";
				}
				break;
			}
			case "boolean-attribute-value": {
				if (dyn !== undefined) {
					throw Error(
						"[internal]: never commit dyn in boolean-attribute-value",
					);
				}

				current.attributes = current.attributes ?? [];
				const attribute = current.attributes[current.attributes.length - 1];

				if ("dyn" in attribute) {
					throw Error("[internal]: can't affect value to a spread attribute");
				}

				attribute.value = true;
				buffer = "";

				break;
			}
			case "quoted-attribute-value": {
				current.attributes = current.attributes ?? [];
				const attribute = current.attributes[current.attributes.length - 1];

				if ("dyn" in attribute) {
					throw Error("[internal]: can't affect value to a spread attribute");
				}

				attribute.value = attribute.value ?? [];

				if (Array.isArray(attribute.value)) {
					attribute.value.push(buffer);
					buffer = "";
					if (dyn !== undefined) {
						attribute.value.push({ dyn });
					}
				}
				break;
			}
			case "comment": {
				if (buffer.length > 0) {
					current.children = current.children ?? [];
					current.children.push(buffer);
					buffer = "";
				}
				if (dyn !== undefined) {
					current.children = current.children ?? [];
					current.children.push({ dyn });
				}
				break;
			}
		}
	}

	function closeTag() {
		if (current === result) {
			throw Error("Missmatch with closing tag");
		}
		path.pop();
		current = path[path.length - 1];
	}

	function opentTag() {
		const buildNode = {};
		current.children = current.children ?? [];
		current.children.push(buildNode);
		path.push(buildNode);
		current = buildNode;
	}
}

/**
 * @param {string} name
 */
function _createElement(name) {
	try {
		return document.createElement(name);
	} catch {
		throw Error(`Invalid element name "${name}"`);
	}
}

/**
 *
 * @param {HTMLElement} element
 * @param {string} name
 * @param {unknown} value
 */
function _setAttribute(element, name, value) {
	try {
		if (name.startsWith("_")) {
			if (name === "_ref" && isRef(value)) {
				value.setNode(element);
			}
		} else if (value === true) {
			element.setAttribute(name, "");
		} else if (value !== undefined && value !== null && value !== false) {
			element.setAttribute(name, String(value));
		}
	} catch {
		throw Error(`Invalid attribute name "${name}"`);
	}
}

/**
 * @param {self.CompiledNode} compiledNode
 * @param {unknown[]} dynamics
 */
function _getProps(compiledNode, dynamics) {
	/** @type {Record<string,unknown>} */
	const props = {};

	if (compiledNode.attributes === undefined) {
		return props;
	}

	for (const attribute of compiledNode.attributes) {
		if (isInterpolation(attribute)) {
			const interpolation = dynamics[attribute.dyn];
			if (typeof interpolation !== "object" || interpolation === null) {
				throw Error("can't spread non object");
			}
			for (const key in interpolation) {
				props[key] = /** @type {any} */ (interpolation)[key];
			}
			continue;
		}

		if (Array.isArray(attribute.value)) {
			const value = attribute.value
				.map((entry) => {
					if (isInterpolation(entry)) {
						return dynamics[entry.dyn];
					}
					return entry;
				})
				.filter((entry) => {
					return (
						typeof entry !== "boolean" && entry !== null && entry !== undefined
					);
				})
				.map((entry) => String(entry))
				.join("");

			props[attribute.name] = value;

			continue;
		}

		/** @type {unknown} */
		let value;
		if (isInterpolation(attribute.value)) {
			value = dynamics[attribute.value.dyn];
		} else {
			value = attribute.value;
		}

		props[attribute.name] = value;
	}

	return props;
}

/**
 *
 * @param {unknown} value
 * @returns {value is { dyn: number }}
 */
function isInterpolation(value) {
	return (
		typeof value === "object" &&
		value !== null &&
		"dyn" in value &&
		typeof value.dyn === "number"
	);
}

/**
 *
 * @param {unknown} value
 * @returns {value is self.Renderable}
 */
function isRenderable(value) {
	return (
		typeof value === "function" &&
		value !== null &&
		"$$renderable$$" in value &&
		value.$$renderable$$ === true
	);
}
