/** @import * as self from "./assert.js" */
import * as chai from "@esm-bundle/chai";

export const assert = /** @type {self.Assert} */ (chai.assert);

Object.defineProperties(assert, {
	arrayItemEquals: { value: arrayItemEquals },
});

/** @type {self.Assert['arrayItemEquals']} */
function arrayItemEquals(actual, expected, message) {
	assert.strictEqual(actual.length, expected.length, message);

	for (let i = 0; i < actual.length; i++) {
		assert.strictEqual(actual[i], expected[i], message);
	}
}
