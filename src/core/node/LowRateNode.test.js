import { assert } from "../../../test/assert.js";
import { OfflineContext } from "../OfflineContext";
import { BaseParam } from "../param/BaseParam";
import { LowRateNode } from "./LowRateNode";

suite("LowRateNode.read", () => {
	test("wrap BaseParam and give its value", () => {
		const context = OfflineContext.create({ length: 1 });
		const baseParam = BaseParam.create(context, {
			defaultValue: 0,
		});
		const node = LowRateNode.source(context, baseParam);
		baseParam.setValueAtTime(1, 1);

		assert.strictEqual(node.read(0), 0);
		assert.strictEqual(node.read(0.9), 0);
		assert.strictEqual(node.read(1), 1);
		assert.strictEqual(node.read(1.1), 1);
	});
});

suite("LowRateNode.connectLowRate", () => {
	test("sum the values of multiple BaseParam", () => {
		const context = OfflineContext.create({ length: 1 });
		const baseParam1 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam2 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam3 = BaseParam.create(context, {
			defaultValue: 1,
		});
		baseParam1.setValueAtTime(2, 1);
		baseParam2.setValueAtTime(3, 1);
		baseParam3.setValueAtTime(4, 1);

		const node1 = LowRateNode.source(context, baseParam1);
		const node2 = LowRateNode.source(context, baseParam2);
		const node3 = LowRateNode.sink(context, baseParam3);

		node1.connectLowRate(node3);
		node2.connectLowRate(node3);

		assert.strictEqual(node3.read(0), 3);
		assert.strictEqual(node3.read(0.9), 3);
		assert.strictEqual(node3.read(1), 9);
		assert.strictEqual(node3.read(1.1), 9);
	});

	test("accumulate values over connections", () => {
		const context = OfflineContext.create({ length: 1 });
		const baseParam1 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam2 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam3 = BaseParam.create(context, {
			defaultValue: 1,
		});
		baseParam1.setValueAtTime(2, 1);
		baseParam2.setValueAtTime(3, 1);
		baseParam3.setValueAtTime(4, 1);

		const node1 = LowRateNode.source(context, baseParam1);
		const node2 = LowRateNode.passthrough(context, baseParam2);
		const node3 = LowRateNode.sink(context, baseParam3);

		node1.connectLowRate(node2);
		node2.connectLowRate(node3);

		assert.strictEqual(node2.read(0), 2);
		assert.strictEqual(node2.read(0.9), 2);
		assert.strictEqual(node2.read(1), 5);
		assert.strictEqual(node2.read(1.1), 5);

		assert.strictEqual(node3.read(0), 3);
		assert.strictEqual(node3.read(0.9), 3);
		assert.strictEqual(node3.read(1), 9);
		assert.strictEqual(node3.read(1.1), 9);
	});

	test("links sink and source", () => {
		const context = OfflineContext.create({ length: 1 });
		const baseParam1 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam2 = BaseParam.create(context, {
			defaultValue: 1,
		});

		const node1 = LowRateNode.passthrough(context, baseParam1);
		const node2 = LowRateNode.sink(context, baseParam2);

		node1.connectLowRate(node2);

		assert.deepStrictEqual(node1.sinks, [node2]);
		assert.deepStrictEqual(node2.sources, [node1]);
	});
});

suite("LowRateNode.disconnectLowRate", () => {
	test("removes the node from the value computation", () => {
		const context = OfflineContext.create({ length: 1 });
		const baseParam1 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam2 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam3 = BaseParam.create(context, {
			defaultValue: 1,
		});

		const node1 = LowRateNode.source(context, baseParam1);
		const node2 = LowRateNode.source(context, baseParam2);
		const node3 = LowRateNode.sink(context, baseParam3);

		node1.connectLowRate(node3);
		node2.connectLowRate(node3);

		node1.disconnectLowRate(node3);

		assert.strictEqual(node3.read(0), 2);
	});

	test("unlink sinks and sources", () => {
		const context = OfflineContext.create({ length: 1 });
		const baseParam1 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam2 = BaseParam.create(context, {
			defaultValue: 1,
		});

		const node1 = LowRateNode.passthrough(context, baseParam1);
		const node2 = LowRateNode.sink(context, baseParam2);

		node1.connectLowRate(node2);

		node1.disconnectLowRate(node2);

		assert.deepStrictEqual(node1.sinks, []);
		assert.deepStrictEqual(node2.sources, []);
	});

	test("can disconnect from all sinks", () => {
		const context = OfflineContext.create({ length: 1 });
		const baseParam1 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam2 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam3 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam4 = BaseParam.create(context, {
			defaultValue: 1,
		});

		const node1 = LowRateNode.passthrough(context, baseParam1);
		const node2 = LowRateNode.sink(context, baseParam2);
		const node3 = LowRateNode.sink(context, baseParam3);
		const node4 = LowRateNode.source(context, baseParam4);

		node1.connectLowRate(node2);
		node1.connectLowRate(node3);
		node4.connectLowRate(node1);

		node1.disconnectLowRate();

		assert.strictEqual(node3.read(0), 1);
		assert.strictEqual(node2.read(0), 1);

		assert.deepStrictEqual(node1.sinks, []);
		assert.deepStrictEqual(node1.sources, [node4]);
		assert.deepStrictEqual(node2.sources, []);
		assert.deepStrictEqual(node3.sources, []);
	});
});

suite("LowRateNode.dispose", () => {
	test("forcibly disconnect sinks and sources", () => {
		const context = OfflineContext.create({ length: 1 });
		const baseParam1 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam2 = BaseParam.create(context, {
			defaultValue: 1,
		});
		const baseParam3 = BaseParam.create(context, {
			defaultValue: 1,
		});

		const node1 = LowRateNode.passthrough(context, baseParam1);
		const node2 = LowRateNode.passthrough(context, baseParam2);
		const node3 = LowRateNode.sink(context, baseParam3);

		node1.connectLowRate(node2);
		node2.connectLowRate(node3);

		node2.dispose();

		assert.deepStrictEqual(node1.sinks, []);
		assert.deepStrictEqual(node2.sources, []);
		assert.deepStrictEqual(node2.sinks, []);
		assert.deepStrictEqual(node3.sources, []);
	});
});
