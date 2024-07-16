/** @import * as self from "./Tab.js" */
import { Ref } from "../dom/Ref.js";
import * as dom from "../dom/dom.js";

import * as s from "./Tab.module.css";

/** @type {dom.Context<string>} */
const tabContainerContext = dom.createContext();

/** @type {self.Tab} */
export function Tab({ name, children }) {
	const id = dom.useId("tab");

	const tabContainer = dom.useContext(tabContainerContext);

	const fragment = dom.render`
		<style>
			.${id}-selector {
				display:none;
			}
			.${id}-tab {
				display:none;
			}
			.${id}-selector:checked {
				~ label[for=${id}] {
					background-color: var(--color-grey-800);
					border-bottom-color: var(--color-grey-800);
				}
				~ .${id}-tab {
					display: block;
				}
			}
		</style>
		<input class="${id}-selector" type="radio" name=${tabContainer} id=${id} checked />
		<label for=${id} class=${s["tab-selector"]}>${name}</label>
		<div class="${id}-tab ${s["tab-body"]}">
			${children}
		</div>

	`;

	return fragment;
}

/** @type {self.TabContainer} */
export function TabContainer({ children }) {
	const id = dom.useId("tab-container");
	const fragment = dom.render`
		<div class=${s["tab-container"]}>
			<${dom.tag(tabContainerContext.Provider, { value: id })}>
				${children}
			</>
		</div>
	`;

	return fragment;
}
