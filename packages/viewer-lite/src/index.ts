import { SVG_THEMES, type SvgThemeColors, exportSvg } from "@bpmnkit/core/svg"
import { parseBpmnLite } from "./adapter.js"

export { parseBpmnLite } from "./adapter.js"

export interface RenderOptions {
	/**
	 * `"light"` (default), `"dark"`, `"auto"` (follow `prefers-color-scheme`), or
	 * a partial palette merged over the light theme. `--bpmnkit-viewer-*` CSS
	 * variables on the element (bg, fill, stroke, flow, text, pool-header, halo)
	 * override the preset; a palette passed here overrides the variables.
	 */
	theme?: "light" | "dark" | "auto" | Partial<SvgThemeColors>
	/** Drag to pan, wheel to zoom. Default: true. */
	interactive?: boolean
}

// In the order of `SvgThemeColors`; `halo` last, as it falls back to `bg`.
const VARS = "bg fill stroke flow text pool-header halo".split(" ")

function palette(theme: RenderOptions["theme"], el: Element): SvgThemeColors {
	const own: Record<string, string | undefined> = typeof theme === "object" ? theme : {}
	const dark =
		theme === "dark" ||
		(theme === "auto" && globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches)
	const c: Record<string, string> = {
		...SVG_THEMES[dark ? "dark" : "light"],
		...(own as Record<string, string>),
	}
	const style = getComputedStyle(el)
	Object.keys(c).map((k, i) => {
		if (!own[k]) {
			c[k] =
				style.getPropertyValue(`--bpmnkit-viewer-${VARS[i]}`).trim() ||
				((i > 5 ? c.bg : c[k]) as string)
		}
	})
	return c as unknown as SvgThemeColors
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
			return message(el, "No diagram layout.")
		}
		svg = exportSvg(defs, { theme: palette(options.theme, el) })
	} catch (e) {
		return message(el, `Cannot show: ${(e as Error).message}`)
	}
	el.innerHTML = svg
	el.setAttribute("data-bpmn-lite", "diagram")
	const s = el.firstElementChild as SVGSVGElement
	// Width follows the container and height the viewBox's aspect ratio, so the diagram fits on load.
	s.removeAttribute("width")
	s.removeAttribute("height")
	s.style.cssText = "display:block;width:100%;height:auto;max-height:90vh"
	if (options.interactive !== false) panZoom(s)
	return true
}

function panZoom(s: SVGSVGElement): void {
	s.style.cssText += ";cursor:grab;touch-action:none"
	const v = (s.getAttribute("viewBox") ?? "").split(" ").map(Number) as [
		number,
		number,
		number,
		number,
	]
	const set = (): void => s.setAttribute("viewBox", v.join(" "))
	// SVG units per CSS pixel: the viewBox is scaled uniformly to fit the box.
	const unit = (r: DOMRect): number => Math.max(v[2] / (r.width || 1), v[3] / (r.height || 1))
	let p: PointerEvent | undefined
	s.onpointerdown = (e) => {
		p = e
		s.setPointerCapture?.(e.pointerId)
	}
	s.onpointermove = (e) => {
		if (!p) return
		const u = unit(s.getBoundingClientRect())
		v[0] -= (e.clientX - p.clientX) * u
		v[1] -= (e.clientY - p.clientY) * u
		p = e
		set()
	}
	s.onpointerup = () => {
		p = undefined
	}
	s.onwheel = (e) => {
		e.preventDefault()
		const k = e.deltaY > 0 ? 1.1 : 1 / 1.1
		const r = s.getBoundingClientRect()
		const u = unit(r) * (1 - k)
		// Keep the point under the cursor fixed while zooming.
		v[0] += (e.clientX - r.left) * u
		v[1] += (e.clientY - r.top) * u
		v[2] *= k
		v[3] *= k
		set()
	}
}

/**
 * Replaces every `<script type="application/bpmn+xml">` in `root` with its
 * diagram. `data-theme="light|dark|auto"` on the script picks the theme.
 */
export function boot(root: ParentNode = document): void {
	for (const script of Array.from(root.querySelectorAll('script[type="application/bpmn+xml"]'))) {
		const div = document.createElement("div")
		div.className = "bpmn-lite"
		const t = script.getAttribute("data-theme")
		const xml = script.textContent ?? ""
		// In the document first: CSS variables are only readable on a connected element.
		script.replaceWith(div)
		render(xml, div, { theme: (t || undefined) as "auto" })
	}
}
