import { assert } from "../../test/assert.js";
import { Timeline } from "./Timeline.js";

suite("Timeline.iterator", () => {
	const events = [
		{ time: 1 },
		{ time: 2 },
		{ time: 2 },
		{ time: 3 },
		{ time: 3 },
		{ time: 3 },
		{ time: 4 },
	];
	const timeline = Timeline.create({});
	events.forEach(timeline.add);

	test("iterates over each events", () => {
		let index = 0;
		for (const event of timeline.iterator()) {
			assert.strictEqual(event, events[index++]);
		}
	});

	test("iterates with from bound", () => {
		let index = 1;
		for (const event of timeline.iterator({ from: { time: 2 } })) {
			assert.strictEqual(event, events[index++]);
		}
	});

	test("iterates with from exclusive bound", () => {
		let index = 3;
		for (const event of timeline.iterator({
			from: { time: 2, inclusive: false },
		})) {
			assert.strictEqual(event, events[index++]);
		}
	});

	test("iterates with to bound", () => {
		let index = 0;
		for (const event of timeline.iterator({ to: { time: 3 } })) {
			assert.strictEqual(event, events[index++]);
		}
		assert.strictEqual(index, 3);
	});

	test("iterates with to inclusive bound", () => {
		let index = 0;
		for (const event of timeline.iterator({
			to: { time: 3, inclusive: true },
		})) {
			assert.strictEqual(event, events[index++]);
		}
		assert.strictEqual(index, 6);
	});

	test("iterates with both from and to bounds", () => {
		let index = 1;
		for (const event of timeline.iterator({
			from: { time: 2 },
			to: { time: 4 },
		})) {
			assert.strictEqual(event, events[index++]);
		}
		assert.strictEqual(index, 6);
	});
});

suite("Timeline.add", () => {
	test("inserts events in increasing time and insertion order", () => {
		const events = [
			{ time: 2 },
			{ time: 3 },
			{ time: 4 },
			{ time: 1 },
			{ time: 3 },
			{ time: 2 },
			{ time: 3 },
		];
		const timeline = Timeline.create({});

		for (const event of events) {
			timeline.add(event);
		}

		const accumulatedEvents = [];
		for (const event of timeline.iterator()) {
			accumulatedEvents.push(event);
		}

		const expected = [
			events[3], // 1
			events[0], // first inserted 2
			events[5], // second inserted 2
			events[1], // first inserted 3
			events[4], // second inserted 3
			events[6], // third inserted 3
			events[2], // 4
		];
		assert.strictEqual(accumulatedEvents.length, expected.length);
		for (let i = 0; i < accumulatedEvents.length; i++) {
			assert.strictEqual(accumulatedEvents[i], expected[i]);
		}
	});

	/*test("garbage collect first 10% when exceeding size", () => {
		const events = Array.from({ length: 20 }, (_, i) => ({ time: i }));
		const timeline = Timeline.create({ size: 20 });
		events.forEach(timeline.add);

		const addedEvent = { time: 30 };
		timeline.add(addedEvent);

		const expected = [...events.slice(2), addedEvent];
		const actual = Array.from(timeline.iterator());
		assert.arrayItemEquals(actual, expected);
	});*/

	test("assert increasing", () => {
		const timeline = Timeline.create({ increasing: true });
		timeline.add({ time: 4 });

		// adding event happening before last event should throw
		assert.throws(() => {
			timeline.add({ time: 1 });
		});
	});
});

suite("Timeline.purge", () => {
	test("purges events before the given time, preserving the one directly before", () => {
		const events = [
			{ time: 1 },
			{ time: 3 },
			{ time: 4 },
			{ time: 4 },
			{ time: 5 },
			{ time: 5 },
			{ time: 9 },
		];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		timeline.purge(5);

		const expected = [events[3], events[4], events[5], events[6]];
		const actual = Array.from(timeline.iterator());
		assert.arrayItemEquals(actual, expected);
	});

	test("purges in the middle of a transaction", () => {
		const events = [
			{ time: 1 },
			{ time: 3, transaction: 1 },
			{ time: 4, transaction: 1 },
			{ time: 4, transaction: 1 },
			{ time: 5, transaction: 1 },
			{ time: 5 },
			{ time: 9 },
		];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		timeline.purge(5);

		const expected = [events[3], events[4], events[5], events[6]];
		const actual = Array.from(timeline.iterator());
		assert.arrayItemEquals(actual, expected);
	});
});

suite("Timeline.last", () => {
	test("returns the last event", () => {
		const lastEvent = { time: 3 };
		const timeline = Timeline.create();
		timeline.add(lastEvent);

		assert.strictEqual(timeline.last(), lastEvent);

		const notLastEvent = { time: 2 };
		timeline.add(notLastEvent);
		assert.strictEqual(timeline.last(), lastEvent);

		const newLastEvent = { time: 5 };
		timeline.add(newLastEvent);
		assert.strictEqual(timeline.last(), newLastEvent);
	});
});

suite("Timeline.has", () => {
	test("returns whether the event is in the timeline", () => {
		const eventInTimeline = { time: 3 };
		const timeline = Timeline.create();
		timeline.add(eventInTimeline);

		assert.isTrue(timeline.has(eventInTimeline));

		const eventNotInTimeline = { time: 3 };
		assert.isFalse(timeline.has(eventNotInTimeline));
	});
});

suite("Timeline.getNext", () => {
	test("returns the next event", () => {
		const events = [{ time: 3 }, { time: 4 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		assert.strictEqual(timeline.getNext(events[0]), events[1]);
	});

	test("handles events not in timeline", () => {
		const events = [{ time: 3 }, { time: 4 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		assert.strictEqual(timeline.getNext({ time: 3 }), undefined);
	});

	test("handles boundary", () => {
		const events = [{ time: 3 }, { time: 4 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		assert.strictEqual(timeline.getNext(events[events.length - 1]), undefined);
	});
});

suite("Timeline.getPrevious", () => {
	test("returns the previous event", () => {
		const events = [{ time: 3 }, { time: 4 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		assert.strictEqual(timeline.getPrevious(events[1]), events[0]);
	});

	test("handles events not in timeline", () => {
		const events = [{ time: 3 }, { time: 4 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		assert.strictEqual(timeline.getPrevious({ time: 4 }), undefined);
	});

	test("handles boundary", () => {
		const events = [{ time: 3 }, { time: 4 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		assert.strictEqual(timeline.getPrevious(events[0]), undefined);
	});
});

suite("Timeline.remove", () => {
	test("remove the target event from the timeline", () => {
		const events = [{ time: 1 }, { time: 2 }, { time: 2 }, { time: 4 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		timeline.remove(events[1]);

		const accumulatedEvents = [];
		for (const event of timeline.iterator()) {
			accumulatedEvents.push(event);
		}

		const expected = [events[0], events[2], events[3]];
		assert.strictEqual(accumulatedEvents.length, expected.length);
		for (let i = 0; i < accumulatedEvents.length; i++) {
			assert.strictEqual(accumulatedEvents[i], expected[i]);
		}
	});

	test("noop if the target event is not in the timeline", () => {
		const events = [{ time: 1 }, { time: 2 }, { time: 2 }, { time: 4 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		timeline.remove({ time: 6 });

		const accumulatedEvents = [];
		for (const event of timeline.iterator()) {
			accumulatedEvents.push(event);
		}

		const expected = events;
		assert.strictEqual(accumulatedEvents.length, expected.length);
		for (let i = 0; i < accumulatedEvents.length; i++) {
			assert.strictEqual(accumulatedEvents[i], expected[i]);
		}
	});
});

suite("Timeline.cancel", () => {
	test("canceling from an empty timeline does nothing", () => {
		const timeline = Timeline.create();

		const canceled = timeline.cancelAfter({ time: 2, currentTime: 0 });

		const timelineContent = Array.from(timeline.iterator());
		assert.arrayItemEquals(timelineContent, []);
		assert.arrayItemEquals(canceled, []);
	});

	test("canceling after last element does nothing", () => {
		const events = [{ time: 1 }, { time: 2 }, { time: 2 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		const canceled = timeline.cancelAfter({
			time: 3,
			currentTime: 0,
			inclusive: true,
		});

		const timelineContent = Array.from(timeline.iterator());
		assert.arrayItemEquals(timelineContent, events);
		assert.arrayItemEquals(canceled, []);
	});

	test("canceling at last element not inclusive does nothing", () => {
		const events = [{ time: 1 }, { time: 2 }, { time: 2 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		const canceled = timeline.cancelAfter({
			time: 2,
			currentTime: 0,
			inclusive: false,
		});

		const timelineContent = Array.from(timeline.iterator());
		assert.arrayItemEquals(timelineContent, events);
		assert.arrayItemEquals(canceled, []);
	});

	test("canceling events after at time before first element cancels everything", () => {
		const events = [{ time: 1 }, { time: 2 }, { time: 2 }, { time: 4 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		const canceled = timeline.cancelAfter({
			time: 0,
			currentTime: 0,
		});

		const timelineContent = Array.from(timeline.iterator());
		assert.arrayItemEquals(timelineContent, []);
		assert.arrayItemEquals(canceled, events);
	});

	test("canceling events after inclusive at time of first element cancels everything", () => {
		const events = [{ time: 1 }, { time: 2 }, { time: 2 }, { time: 4 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		const canceled = timeline.cancelAfter({
			time: 1,
			currentTime: 0,
			inclusive: true,
		});

		const timelineContent = Array.from(timeline.iterator());
		assert.arrayItemEquals(timelineContent, []);
		assert.arrayItemEquals(canceled, events);
	});

	test("events after time", () => {
		const events = [{ time: 1 }, { time: 2 }, { time: 2 }, { time: 4 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		timeline.cancelAfter({ time: 2, currentTime: 0 });

		const accumulatedEvents = [];
		for (const event of timeline.iterator()) {
			accumulatedEvents.push(event);
		}

		const expected = [events[0], events[1], events[2]];
		assert.strictEqual(accumulatedEvents.length, expected.length);
		for (let i = 0; i < accumulatedEvents.length; i++) {
			assert.strictEqual(accumulatedEvents[i], expected[i]);
		}
	});

	test("events before time inclusive", () => {
		const events = [{ time: 1 }, { time: 2 }, { time: 2 }, { time: 4 }];
		const timeline = Timeline.create();
		events.forEach(timeline.add);

		timeline.cancelAfter({ time: 2, currentTime: 0, inclusive: true });

		const accumulatedEvents = [];
		for (const event of timeline.iterator()) {
			accumulatedEvents.push(event);
		}

		const expected = [events[0]];
		assert.strictEqual(accumulatedEvents.length, expected.length);
		for (let i = 0; i < accumulatedEvents.length; i++) {
			assert.strictEqual(accumulatedEvents[i], expected[i]);
		}
	});
});

suite("Timeline transactional", () => {
	test("removing an event removes a whole transaction", () => {
		const events = [
			{ time: 0 },
			{ time: 1, transaction: 1 },
			{ time: 2, transaction: 1 },
			{ time: 4, transaction: 1 },
			{ time: 4 },
			{ time: 4, transaction: 2 },
			{ time: 6, transaction: 2 },
			{ time: 7, transaction: 2 },
			{ time: 7, transaction: 3 },
			{ time: 7, transaction: 3 },
			{ time: 8, transaction: 3 },
		];
		const timeline = Timeline.create({ transactional: true });
		events.forEach(timeline.add);

		timeline.remove(events[2]);

		assert.arrayItemEquals(
			[
				events[0],
				events[4],
				events[5],
				events[6],
				events[7],
				events[8],
				events[9],
				events[10],
			],
			Array.from(timeline.iterator()),
		);

		timeline.remove(events[9]);

		assert.arrayItemEquals(
			[events[0], events[4], events[5], events[6], events[7]],
			Array.from(timeline.iterator()),
		);

		timeline.remove(events[6]);

		assert.arrayItemEquals(
			[events[0], events[4]],
			Array.from(timeline.iterator()),
		);
	});

	/*test("garbage collect remove whole transaction", () => {
		const events = Array.from({ length: 20 }, (_, i) => ({
			time: i,
			transaction: i < 10 ? 1 : undefined,
		}));
		const timeline = Timeline.create({
			size: 20,
			transactional: true,
		});
		events.forEach(timeline.add);

		const addedEvent = { time: 30, transaction: undefined };
		timeline.add(addedEvent);

		const expected = [...events.slice(10), addedEvent];
		const actual = Array.from(timeline.iterator());

		assert.arrayItemEquals(actual, expected);
	});*/

	test("canceling an event in the future cancel the whole transaction in the future", () => {
		const events = [
			{ time: 0 },
			{ time: 1, transaction: 1 },
			{ time: 2, transaction: 1 },
			{ time: 4, transaction: 1 },
			{ time: 5 },
		];
		const timeline = Timeline.create({ transactional: true });
		events.forEach(timeline.add);

		const restorable = timeline.cancelAfter({
			time: 4,
			currentTime: 0,
			inclusive: true,
		});

		assert.arrayItemEquals(Array.from(timeline.iterator()), [events[0]]);
		assert.arrayItemEquals(restorable, [events[4]]);
	});

	test("canceling an event in the future cancel part of the transaction in the future", () => {
		const events = [
			{ time: 0 },
			{ time: 1, transaction: 1 },
			{ time: 2, transaction: 1 },
			{ time: 4, transaction: 1 },
			{ time: 5 },
		];
		const timeline = Timeline.create({ transactional: true });
		events.forEach(timeline.add);

		const restorable = timeline.cancelAfter({
			time: 4,
			currentTime: 2,
			inclusive: true,
		});

		assert.arrayItemEquals(Array.from(timeline.iterator()), [
			events[0],
			events[1],
		]);
		assert.arrayItemEquals(restorable, [events[4]]);
	});

	test("add in the middle of a transaction throws", () => {
		const events = [
			{ time: 0 },
			{ time: 1, transaction: 1 },
			{ time: 2, transaction: 1 },
			{ time: 4, transaction: 1 },
			{ time: 4 },
		];
		const timeline = Timeline.create({ transactional: true });
		events.forEach(timeline.add);

		assert.throws(() => {
			timeline.add({ time: 3, transaction: undefined });
		});
	});

	test("handles transaction of 1 event like if there were no transaction", () => {
		const events = [
			{ time: 0 },
			{ time: 1 },
			{ time: 2, transaction: 1 },
			{ time: 4 },
			{ time: 4 },
		];
		const timeline = Timeline.create({ transactional: true });
		events.forEach(timeline.add);

		timeline.remove(events[2]);

		assert.arrayItemEquals(
			[events[0], events[1], events[3], events[4]],
			Array.from(timeline.iterator()),
		);
	});
});
