import { assert } from "../../../test/assert.js";
import { withContext } from "../../../test/withContext.js";
import { AudioRateParam } from "./AudioRateParam.js";

suite("Param constructor", () => {
	test("a Param can wrap another param", () => {
		return withContext({}, async (context) => {
			const source = context._audioContext.createConstantSource();
			source.connect(context.destination);
			source.start(0);

			const innerParam = AudioRateParam.create(context, {
				audioParam: source.offset,
				min: 0,
				defaultValue: 2,
			});

			const outerParam = AudioRateParam.create(context, {
				audioParam: innerParam,
			});

			assert.strictEqual(outerParam.sink, source.offset);
			assert.strictEqual(outerParam.numberOfInputs, 1);
			assert.strictEqual(outerParam.defaultValue, 2);
			assert.strictEqual(outerParam.min, 0);
			assert.strictEqual(outerParam.max, source.offset.maxValue);
		});
	});
});
