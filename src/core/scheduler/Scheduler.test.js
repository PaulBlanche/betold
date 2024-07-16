import { assert } from "../../../test/assert.js";
import { BaseContext } from "../BaseContext.js";
import { Clock } from "./Clock.js";
import { Scheduler } from "./Scheduler.js";

suite("Scheduler", () => {
	test("can schedule and run tasks", async () => {
		let time = 0;
		const workerClockContext = mockContext("worker");
		const timeoutClockContext = mockContext("timeout");

		const workerScheduler = Scheduler.create(workerClockContext, {
			currentTime: () => time,
		});
		const timeoutScheduler = Scheduler.create(timeoutClockContext, {
			currentTime: () => time,
		});

		/** @type {number[]} */
		const times = [];
		workerScheduler.schedule({ time: 1, task: () => times.push(Date.now()) });
		workerScheduler.schedule({ time: 1, task: () => times.push(Date.now()) });
		workerScheduler.schedule({ time: 2, task: () => times.push(Date.now()) });
		timeoutScheduler.schedule({ time: 1, task: () => times.push(Date.now()) });
		timeoutScheduler.schedule({ time: 1, task: () => times.push(Date.now()) });
		timeoutScheduler.schedule({ time: 2, task: () => times.push(Date.now()) });

		// before time, tasks were not yet executed
		time = 0.9;
		assert.isEmpty(times);

		// exactly at time, tasks were not yet executed
		time = 1;
		assert.isEmpty(times);

		// `updateInterval` second after time, tasks were executed
		const now = Date.now();
		await new Promise((res) => setTimeout(res, 80));
		assert.lengthOf(times, 4);

		// tasks were run between now and now + 50
		assert.isAtLeast(times[0], now);
		assert.isAtMost(times[0], now + 80);
		assert.isAtLeast(times[1], now);
		assert.isAtMost(times[1], now + 80);
		assert.isAtLeast(times[2], now);
		assert.isAtMost(times[2], now + 80);
		assert.isAtLeast(times[3], now);
		assert.isAtMost(times[3], now + 80);

		workerScheduler.dispose();
		timeoutScheduler.dispose();
		workerClockContext.clock.dispose();
		timeoutClockContext.clock.dispose();
	});

	test("can cancel pending tasks", async () => {
		let time = 0;
		const workerClockContext = mockContext("worker");
		const timeoutClockContext = mockContext("timeout");

		const workerScheduler = Scheduler.create(workerClockContext, {
			currentTime: () => time,
		});
		const timeoutScheduler = Scheduler.create(timeoutClockContext, {
			currentTime: () => time,
		});

		/** @type {number[]} */
		const times = [];
		const wId1 = workerScheduler.schedule({
			time: 1,
			task: () => times.push(Date.now()),
		});
		workerScheduler.schedule({ time: 1, task: () => times.push(Date.now()) });
		const tId1 = timeoutScheduler.schedule({
			time: 1,
			task: () => times.push(Date.now()),
		});
		timeoutScheduler.schedule({ time: 1, task: () => times.push(Date.now()) });

		time = 0.9;
		assert.isEmpty(times);

		workerScheduler.cancel(wId1);
		timeoutScheduler.cancel(tId1);

		time = 1;
		await new Promise((res) => setTimeout(res, 80));
		assert.lengthOf(times, 2);

		workerScheduler.dispose();
		timeoutScheduler.dispose();
		workerClockContext.clock.dispose();
		timeoutClockContext.clock.dispose();
	});

	test("can schedule repeat tasks", async () => {
		let time = 0;
		const workerClockContext = mockContext("worker");
		const timeoutClockContext = mockContext("timeout");

		const workerScheduler = Scheduler.create(workerClockContext, {
			currentTime: () => time,
		});
		const timeoutScheduler = Scheduler.create(timeoutClockContext, {
			currentTime: () => time,
		});

		/** @type {number[]} */
		const values1 = [];
		/** @type {number[]} */
		const values2 = [];
		workerScheduler.schedule({
			time: 1,
			interval: 1,
			iteration: 2,
			task: () => values1.push(1),
		});
		timeoutScheduler.schedule({
			time: 1,
			interval: 1,
			iteration: 2,
			task: () => values2.push(2),
		});

		time = 1;
		assert.isEmpty(values1);
		assert.isEmpty(values2);

		await new Promise((res) => setTimeout(res, 200));
		assert.deepEqual(values1, [1]);
		assert.deepEqual(values2, [2]);

		time = 2;
		await new Promise((res) => setTimeout(res, 200));
		assert.deepEqual(values1, [1, 1]);
		assert.deepEqual(values2, [2, 2]);

		time = 3;
		await new Promise((res) => setTimeout(res, 200));
		assert.deepEqual(values1, [1, 1]);
		assert.deepEqual(values2, [2, 2]);

		workerScheduler.dispose();
		timeoutScheduler.dispose();
		workerClockContext.clock.dispose();
		timeoutClockContext.clock.dispose();
	});

	test("can cancel repeat tasks", async () => {
		let time = 0;
		const workerClockContext = mockContext("worker");
		const timeoutClockContext = mockContext("timeout");

		const workerScheduler = Scheduler.create(workerClockContext, {
			currentTime: () => time,
		});
		const timeoutScheduler = Scheduler.create(timeoutClockContext, {
			currentTime: () => time,
		});

		/** @type {number[]} */
		const values1 = [];
		/** @type {number[]} */
		const values2 = [];
		const id1 = workerScheduler.schedule({
			time: 1,
			interval: 1,
			iteration: 3,
			task: () => values1.push(1),
		});
		const id2 = timeoutScheduler.schedule({
			time: 1,
			interval: 1,
			iteration: 3,
			task: () => values2.push(2),
		});

		time = 1;
		await new Promise((res) => setTimeout(res, 200));

		workerScheduler.cancel(id1);

		time = 2;
		await new Promise((res) => setTimeout(res, 200));

		timeoutScheduler.cancel(id2);

		time = 3;
		await new Promise((res) => setTimeout(res, 200));

		assert.deepEqual(values1, [1]);
		assert.deepEqual(values2, [2, 2]);

		workerScheduler.dispose();
		timeoutScheduler.dispose();
		workerClockContext.clock.dispose();
		timeoutClockContext.clock.dispose();
	});
});

/**
 * @param { "worker" | "timeout"} type
 */
function mockContext(type) {
	const clock = Clock.create({
		type,
	});

	return /** @type {BaseContext} */ (
		/** @type {unknown} */ ({
			get currentTime() {
				return 0;
			},
			clock,
			register() {},
			deregister() {},
		})
	);
}
