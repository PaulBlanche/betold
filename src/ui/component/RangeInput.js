/** @import * as self from "./RangeInput.js" */
import { Ref } from "../dom/Ref.js";
import * as dom from "../dom/dom.js";
import { NumberInput } from "./NumberInput.js";

import * as s from "./RangeInput.module.css";

/** @type {self.RangeInput} */
export function RangeInput({
	_ref,
	min,
	max,
	step,
	value,
	id,
	class: className,
}) {
	const $input = _ref ?? Ref.create();
	const $valueIndicator = Ref.create();
	/** @type {Ref<HTMLInputElement>} */
	const $valueInput = Ref.create();
	const $minLabel = Ref.create();
	const $maxLabel = Ref.create();

	const fragment = dom.render`
        <div class="${className} ${s.container}">
			<div class="${s["range-input"]}">
				<input 
					type="range" 
					_ref=${$input} 
					id=${id}
					step=${step.get() ?? "any"} 
					value=${value.get()}
					min=${min.get()} 
					max=${max.get()}
				/>
				<div 
					class="${s.label} ${s.value}" 
					_ref=${$valueIndicator} 
					style="left:${offset()}%;transform: translate(-${offset()}%);"
				>
					<${dom.tag(NumberInput, {
						_ref: $valueInput,
						class: s["value-input"],
						style: `width:${inputLength()}ch`,
						value,
					})} 
					/>
				</div>
			</div>
			<span _ref=${$minLabel} class="${s.label} ${s.min}">${min.get()}</span>
            <span _ref=${$maxLabel} class="${s.label} ${s.max}">${max.get()}</span>
        </div>`;

	$input.node.value = String(value.get());

	$input.node.addEventListener("input", () => {
		const inputValue = $input.node.valueAsNumber;

		if (!Number.isNaN(inputValue)) {
			value.set(inputValue);
		}
	});

	$valueInput.node.addEventListener("input", () => {
		$valueInput.node.style.width = `${inputLength($valueInput.node.value)}ch`;
	});

	value.subscribe((value) => {
		$input.node.value = String(value);
		$valueIndicator.node.style.left = `${offset(value)}%`;
		$valueIndicator.node.style.transform = `translate(-${offset(value)}%`;
		$valueInput.node.value = String(value);
		$valueInput.node.style.width = `${inputLength(value)}ch`;
	});

	min.subscribe((min) => {
		$input.node.min = String(min);
		$minLabel.node.textContent = String(min);
	});

	max.subscribe((max) => {
		$input.node.max = String(max);
		$maxLabel.node.textContent = String(max);
	});

	step.subscribe((step) => {
		$input.node.step = String(step);
	});

	return fragment;

	/**
	 * @param {number=} val
	 * @returns {number}
	 */
	function offset(val = value.get()) {
		return ((val - min.get()) / (max.get() - min.get())) * 100;
	}

	/**
	 * @param {number|string=} val
	 * @returns {number}
	 */
	function inputLength(val = value.get()) {
		return String(val).length + 1;
	}
}
