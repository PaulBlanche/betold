import { assert } from "../../../test/assert.js";
import { compile, createContext, toFragment, useContext } from "./dom";

suite("dom.compile", () => {
	test("empty", () => {
		assert.deepEqual(compile``, { children: [] });
	});

	test("static element", () => {
		assert.deepEqual(compile`<div />`, { children: [{ name: "div" }] });
		assert.deepEqual(compile`<span/>`, { children: [{ name: "span" }] });
		assert.deepEqual(compile`<foo    />`, { children: [{ name: "foo" }] });
		assert.deepEqual(compile`<${"mu"}    />`, {
			children: [{ name: { dyn: 0 } }],
		});
		assert.deepEqual(compile`<    />`, { children: [{ name: "" }] });
		assert.deepEqual(compile`<bar></bar>`, { children: [{ name: "bar" }] });
	});

	test("multiple root element", () => {
		assert.deepEqual(compile`<a /><${"b"}></${"b"}><${"c"}></>`, {
			children: [{ name: "a" }, { name: { dyn: 0 } }, { name: { dyn: 2 } }],
		});
	});

	test("multiple non element root", () => {
		assert.deepEqual(compile`<a />foo<b></>bar${"baz"}`, {
			children: [{ name: "a" }, "foo", { name: "b" }, "bar", { dyn: 0 }],
		});
	});

	test("boolean attributes", () => {
		assert.deepEqual(compile`<a foo />`, {
			children: [{ name: "a", attributes: [{ name: "foo", value: true }] }],
		});
		assert.deepEqual(compile`<a foo bar />`, {
			children: [
				{
					name: "a",
					attributes: [
						{ name: "foo", value: true },
						{ name: "bar", value: true },
					],
				},
			],
		});
	});

	test("boolean attributes before end of tag with no whitespace", () => {
		assert.deepEqual(compile`<a foo/>bar`, {
			children: [
				{ name: "a", attributes: [{ name: "foo", value: true }] },
				"bar",
			],
		});
		assert.deepEqual(compile`<a foo>bar</>`, {
			children: [
				{
					name: "a",
					attributes: [{ name: "foo", value: true }],
					children: ["bar"],
				},
			],
		});
	});

	test("non quoted attributes", () => {
		assert.deepEqual(compile`<a foo=bar />`, {
			children: [{ name: "a", attributes: [{ name: "foo", value: "bar" }] }],
		});
		assert.deepEqual(compile`<a foo=${"bar"} baz=quux />`, {
			children: [
				{
					name: "a",
					attributes: [
						{ name: "foo", value: { dyn: 0 } },
						{ name: "baz", value: "quux" },
					],
				},
			],
		});
	});

	test("non quoted attributes before end of tag with no whitespace", () => {
		assert.deepEqual(compile`<a foo=bar/>baz`, {
			children: [
				{ name: "a", attributes: [{ name: "foo", value: "bar" }] },
				"baz",
			],
		});
		assert.deepEqual(compile`<a foo=bar>baz</>`, {
			children: [
				{
					name: "a",
					attributes: [{ name: "foo", value: "bar" }],
					children: ["baz"],
				},
			],
		});
	});

	test("non quoted attributes with satic/dynamic", () => {
		assert.throws(() => compile`<a foo=bar${"baz"} />`);
		assert.deepEqual(compile`<a foo=${"bar"}baz />`, {
			children: [
				{
					name: "a",
					attributes: [
						{ name: "foo", value: { dyn: 0 } },
						{ name: "baz", value: true },
					],
				},
			],
		});
	});

	test("quoted attribute", () => {
		assert.deepEqual(compile`<a foo="bar'" baz='quux"' foobar="" />`, {
			children: [
				{
					name: "a",
					attributes: [
						{ name: "foo", value: ["bar'"] },
						{ name: "baz", value: ['quux"'] },
						{ name: "foobar", value: [""] },
					],
				},
			],
		});
		assert.deepEqual(compile`<a foo="${"bar"}" />`, {
			children: [
				{
					name: "a",
					attributes: [{ name: "foo", value: ["", { dyn: 0 }, ""] }],
				},
			],
		});
		assert.deepEqual(compile`<a foo="pre${"bar"}post" />`, {
			children: [
				{
					name: "a",
					attributes: [{ name: "foo", value: ["pre", { dyn: 0 }, "post"] }],
				},
			],
		});
	});

	test("quoted attributes before end of tag with no whitespace", () => {
		assert.deepEqual(compile`<a foo="bar"/>baz`, {
			children: [
				{ name: "a", attributes: [{ name: "foo", value: ["bar"] }] },
				"baz",
			],
		});
		assert.deepEqual(compile`<a foo="bar">baz</>`, {
			children: [
				{
					name: "a",
					attributes: [{ name: "foo", value: ["bar"] }],
					children: ["baz"],
				},
			],
		});
	});

	test("mix and match attributes", () => {
		assert.deepEqual(compile`<a foo="bar" baz=quux\nfoobar />`, {
			children: [
				{
					name: "a",
					attributes: [
						{ name: "foo", value: ["bar"] },
						{ name: "baz", value: "quux" },
						{ name: "foobar", value: true },
					],
				},
			],
		});
		assert.deepEqual(compile`<a foo="bar"\tfoobar\rbaz=quux />`, {
			children: [
				{
					name: "a",
					attributes: [
						{ name: "foo", value: ["bar"] },
						{ name: "foobar", value: true },
						{ name: "baz", value: "quux" },
					],
				},
			],
		});
		assert.deepEqual(compile`<a baz=quux \nfoo="bar"\t\nfoobar />`, {
			children: [
				{
					name: "a",
					attributes: [
						{ name: "baz", value: "quux" },
						{ name: "foo", value: ["bar"] },
						{ name: "foobar", value: true },
					],
				},
			],
		});
		assert.deepEqual(compile`<a foobar\t foo="bar"\n\rbaz=quux />`, {
			children: [
				{
					name: "a",
					attributes: [
						{ name: "foobar", value: true },
						{ name: "foo", value: ["bar"] },
						{ name: "baz", value: "quux" },
					],
				},
			],
		});
	});

	test("slash in non quoted attribute close the tag", () => {
		assert.deepEqual(compile`<a foo=ba/r baz=quux  />`, {
			children: [
				{
					name: "a",
					attributes: [{ name: "foo", value: "ba" }],
				},
			],
		});
	});

	test("slash in quoted attribute do not close the tag", () => {
		assert.deepEqual(compile`<a foo="ba/r" baz=quux  />`, {
			children: [
				{
					name: "a",
					attributes: [
						{ name: "foo", value: ["ba/r"] },
						{ name: "baz", value: "quux" },
					],
				},
			],
		});
	});

	test("spread atrributes", () => {
		assert.deepEqual(
			compile`<a ...${{ foo: "bar" }} foo ...${{
				baz: "quux",
			}} foobar=foobar  />`,
			{
				children: [
					{
						name: "a",
						attributes: [
							{ dyn: 0 },
							{ name: "foo", value: true },
							{ dyn: 1 },
							{ name: "foobar", value: "foobar" },
						],
					},
				],
			},
		);
	});

	test("element child", () => {
		assert.deepEqual(compile`<a>foo</a>`, {
			children: [
				{
					name: "a",
					children: ["foo"],
				},
			],
		});
		assert.deepEqual(compile`<a><b/><c/></a>`, {
			children: [
				{
					name: "a",
					children: [{ name: "b" }, { name: "c" }],
				},
			],
		});
		assert.deepEqual(compile`<a>${"foo"}</a>`, {
			children: [
				{
					name: "a",
					children: [{ dyn: 0 }],
				},
			],
		});
		assert.deepEqual(compile`<a><b/>foo${"bar"}<${"c"}/>baz</a>`, {
			children: [
				{
					name: "a",
					children: [
						{ name: "b" },
						"foo",
						{ dyn: 0 },
						{ name: { dyn: 1 } },
						"baz",
					],
				},
			],
		});
	});

	test("comments", () => {
		assert.deepEqual(compile`<!--foo ${"bar"} baz--><a><!--quux--></a>`, {
			children: [
				{
					name: "!--",
					children: ["foo ", { dyn: 0 }, " baz"],
				},
				{
					name: "a",
					children: [{ name: "!--", children: ["quux"] }],
				},
			],
		});
	});

	test('all chars except "/",">","=" and whitespace are allowed in attribute name', () => {
		assert.deepEqual(compile`<a f&@\\:-\0,1"'23çé/>`, {
			children: [
				{
					name: "a",
					attributes: [{ name: `f&@\\:-\0,1"'23çé`, value: true }],
				},
			],
		});
	});

	test('all chars except "/",">" and whitespace are allowed in unquoted attribute value', () => {
		assert.deepEqual(compile`<a foo==f&@\\:-\0,1"'23çé/>`, {
			children: [
				{
					name: "a",
					attributes: [{ name: "foo", value: `=f&@\\:-\0,1"'23çé` }],
				},
			],
		});
	});

	test("all chars except quote are allowed in quoted attribute value", () => {
		assert.deepEqual(compile`<a foo="=f&@\\:-\0,1'23çé/>"/>`, {
			children: [
				{
					name: "a",
					attributes: [{ name: "foo", value: [`=f&@\\:-\0,1'23çé/>`] }],
				},
			],
		});
	});

	test('all chars except "<" are allowed in text', () => {
		assert.deepEqual(compile`<a>f=&@\\:-\0,1'23çé/>"</>`, {
			children: [
				{
					name: "a",
					children: [`f=&@\\:-\0,1'23çé/>"`],
				},
			],
		});
	});

	test("whitespace", () => {
		assert.deepEqual(
			compile`
			<a>
				foo
				bar
				<b></b>
				baz
			</a>`,
			{
				children: [
					"",
					{
						name: "a",
						children: ["foo bar", { name: "b" }, "baz"],
					},
				],
			},
		);
	});
});

suite("dom.render", () => {
	test("empty", () => {
		assert.equal(html(toFragment({ children: [] }, [])), "");
	});

	test("elements", () => {
		assert.equal(
			html(
				toFragment(
					{
						children: [
							{ name: "div" },
							{ name: { dyn: 0 } },
							{ name: "foo", children: [{ name: "div" }] },
						],
					},
					["span"],
				),
			),
			"<div></div><span></span><foo><div></div></foo>",
		);
	});

	test("invalid element name", () => {
		assert.throws(
			() => html(toFragment({ children: [{ name: "" }] }, [])),
			/^Invalid element name ""$/,
		);
		assert.throws(
			() => html(toFragment({ children: [{ name: { dyn: 0 } }] }, ["@div"])),
			/^Invalid element name "@div"$/,
		);
	});

	test("text", () => {
		assert.equal(
			html(
				toFragment(
					{
						children: [
							"foo",
							"bar",
							{ name: "div", children: [{ dyn: 0 }, "baz"] },
							{ dyn: 1 },
						],
					},
					["foobar", "quux"],
				),
			),
			"foobar<div>foobarbaz</div>quux",
		);
	});

	test("same attribute multiple time", () => {
		assert.equal(
			html(
				toFragment(
					{
						children: [
							{
								name: "div",
								attributes: [
									{ name: "foo", value: "0" },
									{ name: "foo", value: "1" },
									{ name: "foo", value: { dyn: 0 } },
								],
							},
						],
					},
					["2"],
				),
			),
			'<div foo="2"></div>',
		);
	});

	test("basic attributes", () => {
		assert.equal(
			html(
				toFragment(
					{
						children: [
							{
								name: "div",
								attributes: [
									{ name: "a", value: "foo" },
									{ name: "b", value: true },
									{ name: "c", value: false },
									{ name: "d", value: { dyn: 0 } },
									{ name: "e", value: { dyn: 1 } },
									{ name: "f", value: { dyn: 2 } },
									{ name: "g", value: { dyn: 3 } },
									{ name: "h", value: { dyn: 4 } },
									{ name: "i", value: { dyn: 5 } },
									{ name: "j", value: { dyn: 6 } },
								],
							},
						],
					},
					["foo", true, false, 0, undefined, null, { foo: "bar" }],
				),
			),
			'<div a="foo" b="" d="foo" e="" g="0" j="[object Object]"></div>',
		);
	});

	test("boolean attributes", () => {
		assert.equal(
			html(
				toFragment(
					{
						children: [
							{
								name: "div",
								attributes: [
									{ name: "disabled", value: true },
									{ name: "required", value: false },
									{ dyn: 0 },
									{ dyn: 1 },
									{ name: "checked", value: { dyn: 2 } },
									{ name: "autofocus", value: { dyn: 3 } },
								],
							},
						],
					},
					[{ visible: true }, { itemscope: false }, true, false],
				),
			),
			'<div disabled="" visible="" checked=""></div>',
		);
	});

	test("spread attributes", () => {
		assert.equal(
			html(
				toFragment(
					{
						children: [
							{
								name: "div",
								attributes: [
									{ name: "foo", value: "0" },
									{ name: "overriden1", value: "0" },
									{ name: "overriden2", value: { dyn: 0 } },
									{ dyn: 1 },
									{ name: "override1", value: "0" },
									{ name: "override2", value: { dyn: 2 } },
									{ name: "bar", value: "0" },
								],
							},
						],
					},
					[
						"0",
						{
							overriden1: "1",
							overriden2: "1",
							override1: "1",
							override2: "1",
						},
						"0",
					],
				),
			),
			'<div foo="0" overriden1="1" overriden2="1" override1="0" override2="0" bar="0"></div>',
		);
	});

	test("composite attributes", () => {
		assert.equal(
			html(
				toFragment(
					{
						children: [
							{
								name: "div",
								attributes: [
									{ name: "a", value: ["a", { dyn: 0 }, "c"] },
									{ name: "b", value: ["a", { dyn: 1 }, "c"] },
									{ name: "c", value: ["a", { dyn: 2 }, "c"] },
									{ name: "d", value: ["a", { dyn: 3 }, "c"] },
									{ name: "e", value: ["a", { dyn: 4 }, "c"] },
									{ name: "f", value: ["a", { dyn: 5 }, "c"] },
									{ name: "g", value: ["a", { dyn: 6 }, "c"] },
								],
							},
						],
					},
					["foo", true, false, 0, undefined, null, { foo: "bar" }],
				),
			),
			'<div a="afooc" b="ac" c="ac" d="a0c" e="ac" f="ac" g="a[object Object]c"></div>',
		);
	});

	test("invalid attribute name", () => {
		assert.throws(
			() =>
				html(
					toFragment(
						{
							children: [
								{ name: "div", attributes: [{ name: "", value: true }] },
							],
						},
						[],
					),
				),
			/^Invalid attribute name ""$/,
		);
		assert.throws(
			() =>
				html(
					toFragment(
						{
							children: [
								{ name: "div", attributes: [{ name: "@foo", value: true }] },
							],
						},
						[],
					),
				),
			/^Invalid attribute name "@foo"$/,
		);
	});

	test("component", () => {
		const dynamics = [
			Component,
			"foo",
			true,
			false,
			0,
			undefined,
			null,
			{ foo: "bar" },
			() => {},
		];

		/** @param {import("./dom").PropsWithChildren<Record<string, unknown>>} _*/
		function Component({ children, ...props }) {
			const fragment = document.createDocumentFragment();
			const b = document.createElement("b");
			if (children) {
				b.appendChild(children());
			}
			fragment.appendChild(b);
			assert.strictEqual(props.a, dynamics[1]);
			assert.strictEqual(props.b, dynamics[2]);
			assert.strictEqual(props.c, dynamics[3]);
			assert.strictEqual(props.d, dynamics[4]);
			assert.strictEqual(props.e, dynamics[5]);
			assert.strictEqual(props.f, dynamics[6]);
			assert.strictEqual(props.g, dynamics[7]);
			assert.strictEqual(props.h, dynamics[8]);
			assert;
			return fragment;
		}

		assert.equal(
			html(
				toFragment(
					{
						children: [
							{
								name: { dyn: 0 },
								attributes: [
									{ name: "a", value: { dyn: 1 } },
									{ name: "b", value: { dyn: 2 } },
									{ name: "c", value: { dyn: 3 } },
									{ name: "d", value: { dyn: 4 } },
									{ name: "e", value: { dyn: 5 } },
									{ name: "f", value: { dyn: 6 } },
									{ name: "g", value: { dyn: 7 } },
									{ name: "h", value: { dyn: 8 } },
								],
								children: ["baz"],
							},
						],
					},
					dynamics,
				),
			),
			"<b>baz</b>",
		);
	});

	test("nested components", () => {
		/** @param {import("./dom").PropsWithChildren<{ foo: string}>} _*/
		function Component1({ children, foo }) {
			const fragment = document.createDocumentFragment();
			const b = document.createElement("a");
			b.setAttribute("foo", foo);
			if (children) {
				b.appendChild(children());
			}
			fragment.appendChild(b);
			return fragment;
		}

		/** @param {import("./dom").PropsWithChildren<{ foo: string}>} _*/
		function Component2({ children, foo }) {
			const fragment = document.createDocumentFragment();
			const b = document.createElement("b");
			b.setAttribute("foo", foo);
			if (children) {
				b.appendChild(children());
			}
			fragment.appendChild(b);
			return fragment;
		}

		assert.equal(
			html(
				toFragment(
					{
						children: [
							{
								name: { dyn: 0 },
								attributes: [{ name: "foo", value: "1" }],
								children: [
									{
										name: { dyn: 1 },
										attributes: [{ name: "foo", value: "2" }],
										children: [
											{
												name: { dyn: 2 },
												attributes: [{ name: "foo", value: "3" }],
											},
										],
									},
								],
							},
						],
					},
					[Component1, Component2, Component1],
				),
			),
			'<a foo="1"><b foo="2"><a foo="3"></a></b></a>',
		);
	});

	test("context", () => {
		const context = createContext(0);

		/** @type {number[]} */
		const values = [];

		/** @type {import("./dom").Component} */
		const Component1 = ({ children }) => {
			values.push(useContext(context));
			return children;
		};

		/** @type {import("./dom").Component<{ value: number }>} */
		const Component2 = ({ children, value }) => {
			return toFragment(
				{
					children: [
						{
							name: { dyn: 0 },
							attributes: [{ name: "value", value: { dyn: 1 } }],
							children: [{ dyn: 2 }],
						},
					],
				},
				[context.Provider, value, children],
			);
		};

		toFragment(
			{
				children: [
					{
						name: { dyn: 0 }, // Component1
						children: [
							{
								name: { dyn: 1 }, // context.Provider value = 1
								attributes: [{ name: "value", value: { dyn: 2 } }],
								children: [
									{
										name: { dyn: 3 }, // Component1
										children: [
											{
												name: { dyn: 4 }, // Component2 value = 2
												attributes: [{ name: "value", value: { dyn: 5 } }],
												children: [
													{
														name: { dyn: 6 }, // Component1
													},
												],
											},
										],
									},
								],
							},
							{
								name: { dyn: 7 }, // context.Provider value = 2
								attributes: [{ name: "value", value: { dyn: 8 } }],
								children: [
									{
										name: { dyn: 9 }, // Component1
									},
								],
							},
						],
					},
				],
			},
			[
				Component1,
				context.Provider,
				1,
				Component1,
				Component2,
				2,
				Component1,
				context.Provider,
				3,
				Component1,
			],
		);

		assert.deepEqual(values, [0, 1, 2, 3]);
	});
});

/**
 * @param {DocumentFragment} fragment
 * @returns {string}
 */
function html(fragment) {
	const element = document.createElement("div");
	element.appendChild(fragment.cloneNode(true));
	return element.innerHTML;
}
