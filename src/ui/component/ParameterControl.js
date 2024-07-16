/** @import * as self from "./ParameterControl.js" */
/** @import { BaseContext } from "../../core/BaseContext.js" */
import { ConstantSourceNode } from "../../core/ConstantSourceNode.js";
import { EventEmitter } from "../../utils/EventEmitter.js";
import { Port } from "../core/Port.js";
import { Ref } from "../dom/Ref.js";
import { Store } from "../dom/Store.js";
import * as dom from "../dom/dom.js";
import { Container } from "./Container.js";
import { NumberInput } from "./NumberInput.js";
import * as s from "./ParameterControl.module.css";
import { RangeInput } from "./RangeInput.js";

/** @type {self.ParameterControlCreator} */
export const ParameterControl = {
	create,
};

/** @type {self.ParameterControlCreator['create']} */
function create(environment, config) {
	const port = Port.source(environment, {
		type: "audiorate",
	});

	const state = {
		/** @type {BaseContext|undefined} */
		context: undefined,
		/** @type {ConstantSourceNode|undefined} */
		cv: undefined,
	};

	const min = config.min ?? Number.NEGATIVE_INFINITY;
	const max = config.max ?? Number.POSITIVE_INFINITY;

	/** @type {Store<self.State>} */
	const store = Store.create({
		initialState: {
			value: config.initialValue ?? min,
			min: min,
			max: max,
			step: config.step ?? (max - min) / 100,
			title: config.title ?? "parameter",
			position: config.position ?? { x: 0, y: 0 },
		},
	});

	const unsubscribeConstraint = store.subscribe((s) => {
		if (s.value < s.min) {
			store.setState({ ...s, value: s.min });
		}
		if (s.value > s.max) {
			store.setState({ ...s, value: s.max });
		}
	});

	const unsubscribeCv = store.subscribe((s) => {
		if (state.cv) {
			state.cv.setValueAtTime(s.value, 0);
		}
	});

	/** @type {EventEmitter<self.Event>} */
	const emitter = EventEmitter.create();

	/** @type {self.ParameterControl} */
	const self = {
		get port() {
			return port;
		},
		get min() {
			return store.getState().min;
		},
		set min(min) {
			store.setState({ ...store.getState(), min });
		},
		get max() {
			return store.getState().max;
		},
		set max(max) {
			store.setState({ ...store.getState(), max });
		},
		get step() {
			return store.getState().step;
		},
		set step(step) {
			if (step !== undefined) {
				store.setState({ ...store.getState(), step });
			}
		},
		get value() {
			return store.getState().value;
		},
		set value(value) {
			if (value !== undefined) {
				store.setState({ ...store.getState(), value });
			}
		},
		get title() {
			return store.getState().title;
		},
		set title(title) {
			store.setState({ ...store.getState(), title });
		},
		get position() {
			return store.getState().position;
		},
		set position(position) {
			store.setState({ ...store.getState(), position });
		},

		setContext,
		apply,
		unsetContext,
		mount,
		dispose,
	};

	environment.register(self);

	return self;

	function dispose() {
		port.dispose();
		unsubscribeConstraint();
		unsubscribeCv();
		environment.deregister(self);
	}

	/** @type {self.ParameterControl['setContext']} */
	function setContext(context) {
		state.context = context;
	}

	/** @type {self.ParameterControl['apply']} */
	function apply() {
		if (state.context === undefined) {
			return;
		}

		const componentState = store.getState();

		state.cv = ConstantSourceNode.create(state.context, {
			defaultValue: componentState.value,
			min: componentState.min,
			max: componentState.max,
		});

		if (port.portNode.node) {
			state.cv.connectAudio(port.portNode.node);
		}
	}

	/** @type {self.ParameterControl['unsetContext']} */
	function unsetContext() {
		state.context = undefined;
		state.cv = undefined;
	}

	/** @type {self.ParameterControl['mount']} */
	function mount(parent) {
		const fragment = dom.render`
			<${storeContext.Provider} value=${store}>
				<${emitterContext.Provider} value=${emitter}>
					<${View} />
				</>
			</>
		`;

		parent.appendChild(fragment);
	}
}

/** @type {dom.Context<Store<self.State>>} */
const storeContext = dom.createContext();

/** @type {dom.Context<EventEmitter<self.Event>>} */
const emitterContext = dom.createContext();

function View() {
	/** @type {Ref<HTMLInputElement>} */
	const $inputRange = Ref.create();
	/** @type {Ref<HTMLDivElement>} */
	const $container = Ref.create();

	const store = dom.useContext(storeContext);

	const unsubscribe = store.subscribe(handleStateUpdate);

	const emitter = dom.useContext(emitterContext);

	const title = store.reactive(
		(state) => state.title,
		(state, value) => store.setState({ ...state, title: value }),
	);

	const value = store.reactive(
		(state) => state.value,
		(state, value) => store.setState({ ...state, value: value }),
	);

	const position = store.reactive(
		(state) => state.position,
		(state, value) => store.setState({ ...state, position: value }),
	);

	const step = store.readonlyReactive((state) => state.step);
	const min = store.readonlyReactive((state) => state.min);
	const max = store.readonlyReactive((state) => state.max);

	const fragment = dom.render`
		<${dom.tag(Container, {
			class: s.container,
			title,
			position,
			onClose,
			_ref: $container,
			config: dom.fragment`
				<${Configuration}/>
			`,
		})}>
			<${dom.tag(RangeInput, {
				_ref: $inputRange,
				step,
				min,
				max,
				value,
			})}/>
		</>
	`;

	return fragment;

	/**
	 * @param {self.State} state
	 */
	function handleStateUpdate(state) {
		$inputRange.node.min = String(state.min);
		$inputRange.node.max = String(state.max);
		$inputRange.node.step = String(state.step);
		$inputRange.node.value = String(state.value);
	}

	function onClose() {
		$container.dispose();
		unsubscribe();
		emitter.emit({ type: "dispose" });
	}
}

/**
 * @returns {DocumentFragment}
 */
function Configuration() {
	const minId = dom.useId("min");
	const maxId = dom.useId("max");
	const stepId = dom.useId("step");
	const store = dom.useContext(storeContext);

	const step = store.reactive(
		(state) => state.step,
		(state, value) => store.setState({ ...state, step: value }),
	);
	const min = store.reactive(
		(state) => state.min,
		(state, value) => store.setState({ ...state, min: value }),
	);
	const max = store.reactive(
		(state) => state.max,
		(state, value) => store.setState({ ...state, max: value }),
	);

	const fragment = dom.render`
			<label for=${minId}>min</label>
			<${dom.tag(NumberInput, { id: minId, value: min })}/>

			<label for=${maxId}>max</label>
			<${dom.tag(NumberInput, { id: maxId, value: max })} />

			<label for=${stepId}>step</label>
			<${dom.tag(NumberInput, { id: maxId, value: step })} />
	`;

	return fragment;
}
