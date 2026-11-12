import { readFileSync } from "node:fs"

export interface HtmlOptions {
	/** The page's `<title>`. Default: "BPMN diagram". */
	title?: string
}

// From dist/html.js and from src/html.ts (tests) this is the same file.
const TEMPLATE = new URL("../dist/template.html", import.meta.url)
const PLACEHOLDER = "{{BPMN}}"
const DEFAULT_TITLE = "BPMN diagram"

// CDATA sections and comments hold `<` literally; everything else cannot.
const LITERAL = /<!\[CDATA\[[\s\S]*?\]\]>|<!--[\s\S]*?-->/g
const END_TAG = /<\/script/gi
const HAS_END_TAG = /<\/script/i

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
 * first (the page template is a build output).
 */
export function toHtml(xml: string, options: HtmlOptions = {}): string {
	const template = readFileSync(TEMPLATE, "utf8")
	const at = template.indexOf(PLACEHOLDER)
	if (at < 0) throw new Error("viewer-lite template has no {{BPMN}} placeholder")
	const head = template
		.slice(0, at)
		.replace(
			`<title>${DEFAULT_TITLE}</title>`,
			`<title>${escapeHtml(options.title ?? DEFAULT_TITLE)}</title>`,
		)
	return head + escapeXmlForScript(xml) + template.slice(at + PLACEHOLDER.length)
}
