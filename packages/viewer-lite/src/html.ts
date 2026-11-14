import { readFileSync } from "node:fs"
import { SVG_THEMES, type SvgThemeColors } from "@bpmnkit/core/svg"

export interface HtmlOptions {
	/** The page's `<title>`. Default: "BPMN diagram". */
	title?: string
	/**
	 * `"light"` (default), `"dark"`, or `"auto"` (follow the reader's
	 * `prefers-color-scheme`). Sets `data-theme` on the script and the page colours.
	 */
	theme?: "light" | "dark" | "auto"
	/**
	 * Brand colours: emitted as `--bpmnkit-viewer-*` variables, which the page and
	 * the viewer both read. Values are checked; a value that could break out of
	 * the CSS throws.
	 */
	colors?: Partial<SvgThemeColors>
}

// From dist/html.js and from src/html.ts (tests) this is the same file.
const TEMPLATE = new URL("../dist/template.html", import.meta.url)
const PLACEHOLDER = "{{BPMN}}"
const SCRIPT_ELEMENT = '<script type="application/bpmn+xml">{{BPMN}}</script>'
const SCRIPT_OPEN = '<script type="application/bpmn+xml">'
const EMPTY_VIEWER =
	'<div class="bpmn-lite" data-bpmn-lite="message">Open or drop a .bpmn file</div>'
const DEFAULT_TITLE = "BPMN diagram"

// CDATA sections and comments hold `<` literally; everything else cannot.
const LITERAL = /<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->/g
const END_TAG = /<\/script/gi
const HAS_END_TAG = /<\/script/i

/** Colour key -> CSS variable suffix, in the order variables are written. */
const VARS: Record<keyof SvgThemeColors, string> = {
	bg: "bg",
	shapeFill: "fill",
	shapeStroke: "stroke",
	flowStroke: "flow",
	text: "text",
	poolHeader: "pool-header",
	textHalo: "halo",
}
// Plain colour syntax only: hex, names, rgb()/hsl()/oklch(), no quotes, braces, `;`, `\`, `<`.
const COLOR = /^[#a-zA-Z0-9(),.% /-]{1,64}$/
const THEMES = ["light", "dark", "auto"]

const declarations = (c: Partial<Record<keyof SvgThemeColors, string>>): string =>
	(Object.keys(VARS) as (keyof SvgThemeColors)[])
		.filter((k) => c[k] !== undefined)
		.map((k) => `--bpmnkit-viewer-${VARS[k]}:${c[k]}`)
		.join(";")

/** The `<style>` text added after the page style, or "". */
function themeCss(theme: string | undefined, colors: HtmlOptions["colors"]): string {
	let css = ""
	if (theme === "dark" || theme === "auto") {
		const { bg, text } = SVG_THEMES.dark
		const rule = `:root{${declarations({ bg, text })}}`
		css += theme === "dark" ? rule : `@media (prefers-color-scheme:dark){${rule}}`
	}
	if (colors) {
		for (const [k, v] of Object.entries(colors)) {
			if (!Object.hasOwn(VARS, k)) throw new Error(`Unknown colour "${k}"`)
			if (typeof v !== "string" || !COLOR.test(v) || /url\(|var\(|expression/i.test(v)) {
				throw new Error(`Invalid colour for "${k}": ${JSON.stringify(v)}`)
			}
		}
		const d = declarations(colors as Record<string, string>)
		if (d) css += `:root{${d}}`
	}
	return css
}

const escapeHtml = (s: string): string =>
	s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")

/**
 * Makes BPMN XML safe inside `<script type="application/bpmn+xml">` without
 * changing what it parses to: an HTML parser ends that element at the first
 * `</script`, and the viewer reads the raw text, so only XML-level escapes
 * survive.
 */
export function escapeXmlForScript(xml: string): string {
	let out = ""
	let last = 0
	const plain = (s: string): string => {
		// A bare `</script` outside CDATA/comments can only be an end tag of a
		// `<script>` element: there is no way to hide it.
		if (HAS_END_TAG.test(s)) {
			throw new Error("The BPMN XML contains a <script> element, which cannot be inlined in HTML")
		}
		return s
	}
	for (const m of xml.matchAll(LITERAL)) {
		const at = m.index ?? 0
		out += plain(xml.slice(last, at))
		last = at + m[0].length
		out += m[0].startsWith("<![CDATA[")
			? // Close and reopen the section so the text is the same after parsing.
				m[0].replace(END_TAG, (t) => `</]]><![CDATA[${t.slice(2)}`)
			: m[0].replace(END_TAG, (t) => `<\\${t.slice(1)}`)
	}
	return out + plain(xml.slice(last))
}

/**
 * One self-contained HTML page showing the diagram: the viewer script is
 * inlined, so the file needs no network and no other files. Run `pnpm build`
 * first (the page template is a build output). Every page has a file picker
 * and accepts a dropped file; with blank `xml` it opens as an empty viewer
 * that only shows that hint.
 */
export function toHtml(xml: string, options: HtmlOptions = {}): string {
	if (options.theme !== undefined && !THEMES.includes(options.theme)) {
		throw new Error(`Unknown theme "${options.theme}"`)
	}
	const template = readFileSync(TEMPLATE, "utf8")
	const blank = !xml.trim()
	const at = template.indexOf(PLACEHOLDER)
	if (at < 0) throw new Error("viewer-lite template has no {{BPMN}} placeholder")
	const head = (t: string): string => {
		const css = themeCss(options.theme, options.colors)
		let out = css ? t.replace("</style>", () => `${css}</style>`) : t
		if (options.theme !== undefined) {
			out = out.replace("<body>", () => `<body data-theme="${options.theme}">`)
		}
		return out.replace(
			`<title>${DEFAULT_TITLE}</title>`,
			() => `<title>${escapeHtml(options.title ?? DEFAULT_TITLE)}</title>`,
		)
	}
	if (blank) {
		const el = template.indexOf(SCRIPT_ELEMENT)
		return head(template.slice(0, el)) + EMPTY_VIEWER + template.slice(el + SCRIPT_ELEMENT.length)
	}
	const opened = options.theme === undefined ? "" : ` data-theme="${options.theme}"`
	const before = head(template.slice(0, at)).replace(
		SCRIPT_OPEN,
		() => `<script type="application/bpmn+xml"${opened}>`,
	)
	return before + escapeXmlForScript(xml) + template.slice(at + PLACEHOLDER.length)
}
