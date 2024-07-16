/** @import * as self from "./NumberInput.js" */
import { Ref } from "../dom/Ref.js";
import * as dom from "../dom/dom.js";
import * as s from "./NumberInput.module.css";

/** @type {self.NumberInput} */
export function NumberInput({ _ref, id, value, class: className, style }) {
	const $input = _ref ?? Ref.create();

	let dirty = false;

	const fragment = dom.render`
		<input 
			type="text" 
			class="${s.input} ${className}" 
			style=${style} 
			_ref=${$input} 
			id=${id} 
			value=${value.get()}
		>
	`;

	value.subscribe((value) => {
		$input.node.value = String(value);
	});

	$input.node.addEventListener("input", () => {
		dirty = true;
	});

	$input.node.addEventListener("blur", () => {
		if (!dirty) {
			return;
		}
		dirty = false;

		const inputValue = Number($input.node.value);
		if (Number.isNaN(inputValue)) {
			$input.node.value = String(value.get());
		} else {
			value.set(inputValue);
		}
	});

	$input.node.addEventListener("keydown", (event) => {
		if (!dirty) {
			return;
		}
		dirty = false;

		if (event.key !== "Enter") {
			return;
		}

		const inputValue = Number($input.node.value);
		if (Number.isNaN(inputValue)) {
			$input.node.value = String(value.get());
		} else {
			value.set(inputValue);
		}
	});

	return fragment;
}
