// The HTML diff viewer: spec/templates/diff-viewer.{html,css,js} become one template string,
// emitted to TS and Rust so `renderDiffHtml` and `diff_to_html` substitute the same bytes.
// Not JSON, so this area has no schema; main() calls `generate()` without a parsed source.
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { header } from "./util.mjs"

export const source = "spec/templates/diff-viewer.html"
export const raw = true

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..")
const read = (name) => readFileSync(join(ROOT, "spec/templates", name), "utf8")

/** The template with CSS and JS inlined; only the render-time `{{…}}` placeholders remain. */
export function template() {
	const style = read("diff-viewer.css").trim()
	const script = read("diff-viewer.js").trim()
	// A function replacer: `$` in the inlined code must not be read as a pattern.
	return read("diff-viewer.html")
		.replace("{{STYLE}}", () => `\n${style}\n`)
		.replace("{{SCRIPT}}", () => `\n${script}\n`)
}

/** A Rust raw string literal with enough `#`s that the text cannot close it early. */
function rustRaw(s) {
	let hashes = "#"
	while (s.includes(`"${hashes}`)) hashes += "#"
	return `r${hashes}"${s}"${hashes}`
}

export function generate() {
	const text = template()
	const sources = "spec/templates/diff-viewer.{html,css,js}"
	return {
		"packages/core/src/generated/diff-viewer.ts": `${header(sources)}
/**
 * The self-contained diff viewer page. Placeholders: {{TITLE}}, {{SUMMARY}}, {{BEFORE_LABEL}},
 * {{AFTER_LABEL}}, {{BEFORE_SVG}}, {{AFTER_SVG}}, {{CHANGES}}, {{DIFF_JSON}}.
 */
export const DIFF_VIEWER_TEMPLATE: string = ${JSON.stringify(text)}
`,
		"crates/bpmnkit-spec/src/generated/diff_viewer.rs": `${header(sources)}
/// The self-contained diff viewer page. Placeholders: \`{{TITLE}}\`, \`{{SUMMARY}}\`,
/// \`{{BEFORE_LABEL}}\`, \`{{AFTER_LABEL}}\`, \`{{BEFORE_SVG}}\`, \`{{AFTER_SVG}}\`, \`{{CHANGES}}\`,
/// \`{{DIFF_JSON}}\`.
pub const DIFF_VIEWER_TEMPLATE: &str = ${rustRaw(text)};
`,
	}
}
