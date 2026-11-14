#!/usr/bin/env node
/**
 * Vendors the viewer-lite browser assets into crates/bpmnkit-viewer (crates.io packages
 * only what is inside the crate) and records golden pages made by the JS `toHtml`, which
 * the Rust tests compare byte for byte.
 *
 *   node scripts/viewer-assets.mjs           write assets/ and tests/golden/
 *   node scripts/viewer-assets.mjs --check   fail when either is stale
 *
 * Needs `pnpm --filter @bpmnkit/viewer-lite build` first (it reads dist/).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const root = new URL("..", import.meta.url).pathname
const lite = join(root, "packages/viewer-lite")
const crate = join(root, "crates/bpmnkit-viewer")
const check = process.argv.includes("--check")

if (!existsSync(join(lite, "dist/html.js"))) {
	console.error("viewer-assets: run `pnpm --filter @bpmnkit/viewer-lite build` first")
	process.exit(1)
}
const { css, picker } = await import(join(lite, "scripts/build.mjs"))
const { toHtml } = await import(join(lite, "dist/html.js"))

const order = readFileSync(join(root, "conformance/bpmn/sample-order-process/input.bpmn"), "utf8")
const withText = (text) =>
	order.replace(
		"</bpmn:process>",
		() =>
			`<bpmn:textAnnotation id="TA"><bpmn:text>${text}</bpmn:text></bpmn:textAnnotation></bpmn:process>`,
	)

/** Each case is `<name>.bpmn` (input) and `<name>.html` (expected); options (title, theme, colors) in cases.json. */
const cases = [
	{ name: "order", xml: order },
	{ name: "title", xml: order, title: "A <b> & c {{BPMN}}" },
	{ name: "cdata", xml: withText("<![CDATA[if (a) </script> else </SCRIPT>]]>") },
	{ name: "comment", xml: withText("x<!-- </script> -->y {{BPMN}} $&") },
	{ name: "empty", xml: "" },
	{ name: "blank", xml: "  \n" },
	{ name: "dark", xml: order, theme: "dark" },
	{ name: "auto", xml: order, theme: "auto" },
	{
		name: "colors",
		xml: order,
		colors: { bg: "#fff8e1", stroke: "rgb(10, 20, 30)", "pool-header": "oklch(70% 0.1 200)" },
	},
	{ name: "light-title", xml: order, theme: "light", title: "Light & titled" },
]
// Option keys use the Rust spelling for colours (`pool-header`); JS names differ.
const JS_COLORS = {
	bg: "bg",
	fill: "shapeFill",
	stroke: "shapeStroke",
	flow: "flowStroke",
	text: "text",
	"pool-header": "poolHeader",
	halo: "textHalo",
}
const optionsOf = ({ title, theme, colors }) => ({
	...(title === undefined ? {} : { title }),
	...(theme === undefined ? {} : { theme }),
	...(colors === undefined
		? {}
		: { colors: Object.fromEntries(Object.entries(colors).map(([k, v]) => [JS_COLORS[k], v])) }),
})

const files = {
	"assets/viewer-lite.min.js": readFileSync(join(lite, "dist/viewer-lite.min.js"), "utf8"),
	"assets/loader.js": picker,
	"assets/viewer.css": css,
	"tests/golden/cases.json": `${JSON.stringify(
		cases.map(({ xml, ...rest }) => rest),
		null,
		"\t",
	)}\n`,
}
for (const c of cases) {
	files[`tests/golden/${c.name}.bpmn`] = c.xml
	files[`tests/golden/${c.name}.html`] = toHtml(c.xml, optionsOf(c))
}

const stale = []
for (const [rel, text] of Object.entries(files)) {
	const path = join(crate, rel)
	const now = existsSync(path) ? readFileSync(path, "utf8") : undefined
	if (now === text) continue
	if (check) stale.push(rel)
	else {
		mkdirSync(join(path, ".."), { recursive: true })
		writeFileSync(path, text)
	}
}
if (stale.length > 0) {
	console.error(
		`viewer-assets: stale in crates/bpmnkit-viewer: ${stale.join(", ")}\nRun node scripts/viewer-assets.mjs`,
	)
	process.exit(1)
}
console.log(`viewer-assets: ${Object.keys(files).length} files ${check ? "up to date" : "written"}`)
