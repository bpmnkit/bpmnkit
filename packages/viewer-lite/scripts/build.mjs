#!/usr/bin/env node
/**
 * Bundles src/auto.ts into dist/viewer-lite.min.js (IIFE, es2020, minified) and
 * writes dist/template.html: one self-contained page with that script inlined
 * and a `{{BPMN}}` placeholder for the diagram's XML.
 */

import { mkdirSync, writeFileSync } from "node:fs"
import { build } from "esbuild"

const dist = new URL("../dist/", import.meta.url)

/** The minified IIFE, safe to inline in a `<script>` element. */
export async function bundle() {
	const out = await build({
		entryPoints: [new URL("../src/auto.ts", import.meta.url).pathname],
		bundle: true,
		format: "iife",
		target: "es2020",
		minify: true,
		legalComments: "none",
		// Non-ASCII stays as-is instead of \u escapes; the page is UTF-8.
		charset: "utf8",
		write: false,
	})
	// A literal `</script` would end the inline element early.
	return out.outputFiles[0].text.replaceAll("</script", "<\\/script")
}

/** The page style; also vendored into crates/bpmnkit-viewer (scripts/viewer-assets.mjs). */
export const css =
	"html,body{margin:0;background:var(--bpmnkit-viewer-bg,#f8f9fa);font:14px system-ui,sans-serif;color:var(--bpmnkit-viewer-text,#333)}" +
	".bpmn-lite{padding:8px}[data-bpmn-lite=message]{padding:24px}" +
	"body{min-height:100vh;box-sizing:border-box}header{padding:8px 8px 0;font-size:13px}" +
	"body.drop{outline:2px dashed currentColor;outline-offset:-6px}"

/**
 * Open/drop glue, kept out of the size-gated viewer script: a second tiny
 * inline script that feeds a picked or dropped file to \`BpmnLite.render\`.
 * Runs after boot (registered later), so \`.bpmn-lite\` already exists.
 */
export const picker =
	'const d=document,b=d.body,f=d.getElementById("bpmn-open"),' +
	"run=()=>{const c=d.querySelector('.bpmn-lite')," +
	"open=async t=>{if(t)BpmnLite.render(await t.text(),c,{theme:b.dataset.theme})};" +
	"f.onchange=()=>open(f.files[0]);" +
	'd.ondragover=e=>{e.preventDefault();b.classList.add("drop")};' +
	'd.ondragleave=()=>b.classList.remove("drop");' +
	'd.ondrop=e=>{e.preventDefault();b.classList.remove("drop");open(e.dataTransfer.files[0])}};' +
	'd.readyState=="loading"?d.addEventListener("DOMContentLoaded",run):run()'

/** The page: the XML goes in place of `{{BPMN}}` (escape any `</script` in it). */
export const template = (js) =>
	`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BPMN diagram</title><style>${css}</style></head><body><header><label>Open <input type="file" id="bpmn-open" accept=".bpmn,.xml"></label></header><script type="application/bpmn+xml">{{BPMN}}</script><script>${js}</script><script>${picker}</script></body></html>\n`

if (import.meta.url === `file://${process.argv[1]}`) {
	const js = await bundle()
	mkdirSync(dist, { recursive: true })
	writeFileSync(new URL("viewer-lite.min.js", dist), js)
	writeFileSync(new URL("template.html", dist), template(js))
}
