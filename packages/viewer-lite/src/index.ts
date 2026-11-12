import { exportSvg } from "@bpmnkit/core/svg"
import { parseBpmnLite } from "./adapter.js"

export { parseBpmnLite } from "./adapter.js"

export interface RenderOptions {
	/** Default: the reader's `prefers-color-scheme`. */
	theme?: "light" | "dark"
	/** Drag to pan, wheel to zoom. Default: true. */
	interactive?: boolean
}

const message = (el: Element, text: string): false => {
	el.textContent = text
	el.setAttribute("data-bpmn-lite", "message")
	return false
}

/**
 * Draws a BPMN 2.0 XML diagram into `el`, replacing its content. A file
 * without diagram layout (DI) or that cannot be read shows a short message
 * instead, and `false` is returned.
 */
export function render(xml: string, el: Element, options: RenderOptions = {}): boolean {
	let svg: string
	try {
		const defs = parseBpmnLite(xml)
		if (!defs.diagrams.some((d) => d.plane.shapes.length > 0)) {
			return message(el, "This BPMN file has no diagram layout to show.")
		}
		const dark = globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches
		svg = exportSvg(defs, { theme: options.theme ?? (dark ? "dark" : "light") })
	} catch (e) {
		return message(el, `Cannot show this BPMN diagram: ${(e as Error).message}`)
	}
	el.innerHTML = svg
	el.setAttribute("data-bpmn-lite", "diagram")
	const s = el.firstElementChild
	if (!(s instanceof SVGSVGElement)) return true
	// Width follows the container and height the viewBox's aspect ratio, so the diagram fits on load.
	s.removeAttribute("width")
	s.removeAttribute("height")
	s.style.cssText = "display:block;width:100%;height:auto;max-height:90vh"
	if (options.interactive !== false) panZoom(s)
	return true
}

function panZoom(s: SVGSVGElement): void {
	let [x = 0, y = 0, w = 1, h = 1] = (s.getAttribute("viewBox") ?? "").split(" ").map(Number)
	const set = (): void => s.setAttribute("viewBox", `${x} ${y} ${w} ${h}`)
	// SVG units per CSS pixel: the viewBox is scaled uniformly to fit the box.
	const unit = (r: DOMRect): number => Math.max(w / (r.width || 1), h / (r.height || 1))
	let drag: { x: number; y: number } | undefined
	s.style.cursor = "grab"
	s.style.touchAction = "none"
	s.addEventListener("pointerdown", (e) => {
		drag = { x: e.clientX, y: e.clientY }
		s.setPointerCapture?.(e.pointerId)
	})
	s.addEventListener("pointermove", (e) => {
		if (!drag) return
		const u = unit(s.getBoundingClientRect())
		x -= (e.clientX - drag.x) * u
		y -= (e.clientY - drag.y) * u
		drag = { x: e.clientX, y: e.clientY }
		set()
	})
	s.addEventListener("pointerup", () => {
		drag = undefined
	})
	s.addEventListener(
		"wheel",
		(e) => {
			e.preventDefault()
			const k = e.deltaY > 0 ? 1.1 : 1 / 1.1
			const r = s.getBoundingClientRect()
			const u = unit(r)
			// Keep the point under the cursor fixed while zooming.
			const px = x + (e.clientX - r.left) * u
			const py = y + (e.clientY - r.top) * u
			x = px - (px - x) * k
			y = py - (py - y) * k
			w *= k
			h *= k
			set()
		},
		{ passive: false },
	)
}

/** Replaces every `<script type="application/bpmn+xml">` in `root` with its diagram. */
export function boot(root: ParentNode = document): void {
	for (const script of Array.from(root.querySelectorAll('script[type="application/bpmn+xml"]'))) {
		const div = document.createElement("div")
		div.className = "bpmn-lite"
		render(script.textContent ?? "", div)
		script.replaceWith(div)
	}
}
