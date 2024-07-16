/** @typedef {{name?:string|{dyn:number}, attributes?:{ name: string, value?:string|{dyn:number}|(string|{dyn:number})[]}[], children?: (BuildNode|string|{dyn:number})[]}} BuildNode */

/**
 * @param {TemplateStringsArray} statics
 * @param {any[]} fu
 */
function build(statics, ...fu) {
	let context = "text";
	let buffer = "";
	let quote = "";

	/** @type {BuildNode} */
	const fragment = { name: "fragment", children: [] };
	const path = [fragment];
	let current = fragment;

	for (let i = 0; i < statics.length; i++) {
		if (i > 0) {
			parse(i - 1, undefined);
		}

		for (let j = 0; j < statics[i].length; j++) {
			parse(i, j);
		}
	}
	commit();

	return fragment;

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
					throw Error("Attribute names must be fully static");
				}
				const char = statics[i][j];
				if (char === "=") {
					commit();
					context = "attribute-value";
				} else if (WHITESPACES.includes(char)) {
					commit();
					context = "attribute-value";
					commit();
					context = "attributes";
				} else {
					buffer += char;
				}
				break;
			}
			case "attribute-value": {
				if (j === undefined) {
					commit(i);
					context = "attributes";
				} else {
					const char = statics[i][j];
					if (char === "'" || char === '"') {
						quote = char;
						context = "quoted-attribute-value";
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
		}
	}

	/**
	 * @param {number=} dyn
	 */
	function commit(dyn) {
		switch (context) {
			case "text": {
				current.children = current.children ?? [];
				if (buffer.length > 0) {
					current.children.push(buffer);
					buffer = "";
				}
				if (dyn !== undefined) {
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
			case "attribute-name": {
				current.attributes = current.attributes ?? [];
				current.attributes.push({ name: buffer });
				buffer = "";
				break;
			}
			case "attribute-value": {
				current.attributes = current.attributes ?? [];
				const attribute = current.attributes[current.attributes.length - 1];

				if (dyn !== undefined) {
					if (buffer.length > 0) {
						throw Error(
							"Unquoted attributes mus either be fully static or dynamic",
						);
					}
					attribute.value = { dyn };
				} else {
					attribute.value = buffer;
					buffer = "";
				}
				break;
			}
			case "quoted-attribute-value": {
				current.attributes = current.attributes ?? [];
				const attribute = current.attributes[current.attributes.length - 1];
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
		}
	}

	function closeTag() {
		if (current === fragment) {
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

const WHITESPACES = [" ", "\n", "\t", "\r"];

console.dir(
	build`bii${"bubu"}<div   foo />toto<mu  bar=bu mar=${"mu"} var=${"nu"}to chu="${"lu"}">tata<mo@vu>titi</></>tutu`,
	{
		depth: null,
	},
);
