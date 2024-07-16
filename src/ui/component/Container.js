import { Ref } from "../dom/Ref.js";
import { Store } from "../dom/Store.js";
/** @import * as self from "./Container.js" */
import * as dom from "../dom/dom.js";

import * as s from "./Container.module.css";

/** @type {Store<string[]>} */
const Z_BUFFER = Store.create({
	initialState: [],
});

/** @type {self.Container} */
export function Container({
	onClose,
	title,
	position,
	_ref,
	children,
	config,
	class: className,
}) {
	/** @type {Ref<HTMLButtonElement>} */
	const $closeButton = Ref.create();
	/** @type {Ref<HTMLButtonElement>} */
	const $toggleConfigButton = Ref.create();
	/** @type {Ref<HTMLElement>} */
	const $configPanel = Ref.create();
	/** @type {Ref<HTMLElement>} */
	const $titlebar = Ref.create();
	const $container = _ref ?? Ref.create();

	let isConfigOpen = false;
	const id = dom.useId();

	Z_BUFFER.setState([...Z_BUFFER.getState(), id]);

	const fragment = dom.render`
        <div 
			_ref=${$container} 
			style="z-index:${zindex()};left:${position.get().x};top:${
				position.get().y
			}" 
			class="${s.container} ${className}"
		>
            <div class=${s.titlebar}>
                <button class=${s.close} _ref=${$closeButton}>✕</button>
                <span _ref=${$titlebar} class=${s.title}>
					${title.get()}
				</span>
				${
					config &&
					dom.render`
						<button 
							_ref=${$toggleConfigButton} 
							data-open=${false} 
							class=${s["toggle-config"]}
						>
							▷
						</button>
					`
				}
            </div>
            <div class=${s.body}>
                ${children}
            </div>
			${
				config &&
				dom.render`
					<div
						_ref=${$configPanel} 
						data-open=${false} 
						class="${s.config}"
					>
						${config}
					</div>
				`
			}
        </div>
    `;

	$titlebar.node.addEventListener("mousedown", _startDrag, {
		passive: true,
	});

	$closeButton.node.addEventListener("click", onClose);

	if (config) {
		$toggleConfigButton.node.addEventListener("click", () => {
			isConfigOpen = !isConfigOpen;

			$configPanel.node.toggleAttribute("data-open", isConfigOpen);
			$toggleConfigButton.node.toggleAttribute("data-open", isConfigOpen);

			if (isConfigOpen) {
				$toggleConfigButton.node.textContent = "◁";
			} else {
				$toggleConfigButton.node.textContent = "▷";
			}
		});
	}

	$container.node.addEventListener("focusin", () => {
		focus();
	});

	Z_BUFFER.subscribe((ids) => {
		$container.node.style.zIndex = String(zindex(ids));
	});

	/** @type {number} */
	let animationHandle = -1;
	position.subscribe((value) => {
		cancelAnimationFrame(animationHandle);
		animationHandle = requestAnimationFrame(() => {
			$container.node.style.left = `${value.x}px`;
			$container.node.style.top = `${value.y}px`;
		});
	});

	return fragment;

	function zindex(ids = Z_BUFFER.getState()) {
		return ids.indexOf(id);
	}

	function focus() {
		const i = zindex();
		if (i !== -1) {
			const s = Z_BUFFER.getState();
			s.splice(i, 1);
			s.push(id);
			Z_BUFFER.setState([...s]);
		}
	}

	/**
	 * @param {MouseEvent} event
	 */
	function _startDrag(event) {
		focus();
		const rect = $container.node.getBoundingClientRect();

		const offsetX = event.pageX;
		const offsetY = event.pageY;

		position.set({
			x: rect.left + document.body.scrollLeft,
			y: rect.top + document.body.scrollTop,
		});

		document.body.addEventListener("mouseup", _handleDragEnd, {
			passive: true,
		});

		document.body.addEventListener("mousemove", _handleDrag, {
			passive: true,
		});

		function _handleDragEnd() {
			document.body.removeEventListener("mouseup", _handleDragEnd);
			document.body.removeEventListener("mousemove", _handleDrag);
		}

		/** @type {number|undefined} */
		let timeoutHandle = undefined;
		/** @type {{x:number, y:number}} */
		let pos;

		/**
		 * @param {MouseEvent} event
		 */
		function _handleDrag(event) {
			pos = {
				x: rect.left + document.body.scrollLeft + (event.pageX - offsetX),
				y: rect.top + document.body.scrollTop + (event.pageY - offsetY),
			};

			if (!timeoutHandle) {
				timeoutHandle = window.setTimeout(() => {
					timeoutHandle = undefined;
					position.set(pos);
				}, 100);
			}
			/*position.set({
				x: rect.left + document.body.scrollLeft + (event.pageX - offsetX),
				y: rect.top + document.body.scrollTop + (event.pageY - offsetY),
			});*/
		}
	}
}
