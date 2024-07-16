/** @import * as self from "./mixin.js" */

/** @type {self.mixin} */
export function mixin(...sources) {
	const mixin = /** @type {any} */ ({});

	for (const source of sources) {
		for (const name of Object.getOwnPropertyNames(source)) {
			_copyProperty(source, name, mixin);
		}
		for (const symbol of Object.getOwnPropertySymbols(source)) {
			_copyProperty(source, symbol, mixin);
		}
	}

	return mixin;
}

/** @type {self.omit} */
export function omit(source, keys) {
	const omit = /** @type {any} */ ({});

	for (const name of Object.getOwnPropertyNames(source)) {
		if (!keys.includes(/** @type {any} */ (name))) {
			_copyProperty(source, name, omit);
		}
	}
	for (const symbol of Object.getOwnPropertySymbols(source)) {
		if (!keys.includes(/** @type {any} */ (symbol))) {
			_copyProperty(source, symbol, omit);
		}
	}

	return omit;
}

const o = omit({ foo: 1, bar: 2 }, ["bar"]);
const a = mixin(omit({ foo: 1, bar: "toto" }, []), { bar: 1 });

/**
 * @param {any} source
 * @param {string|number|symbol} name
 * @param {any} destination
 */
function _copyProperty(source, name, destination) {
	const descriptor = Object.getOwnPropertyDescriptor(source, name);
	if (descriptor !== undefined) {
		Object.defineProperty(destination, name, descriptor);
	}
}
