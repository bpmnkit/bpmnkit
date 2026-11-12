#!/usr/bin/env node
/**
 * Chromium smoke test (needs `pnpm build` first and Playwright installed):
 * opens dist/template.html filled with a fixture and checks the diagram is
 * drawn and pans/zooms, then checks that the viewer's DOMParser adapter draws
 * every conformance fixture exactly like the core parser — including the
 * CDATA fixtures happy-dom cannot parse in the unit tests.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { createRequire } from "node:module"
import { join } from "node:path"
import { Bpmn } from "@bpmnkit/core"
import { exportSvg } from "@bpmnkit/core/svg"

const { chromium } = createRequire(import.meta.url)("playwright")
const here = new URL("..", import.meta.url).pathname
const FIXTURES = join(here, "../../conformance/bpmn")
const template = readFileSync(join(here, "dist/template.html"), "utf8")
const fixture = (n) => readFileSync(join(FIXTURES, n, "input.bpmn"), "utf8")

const fail = (msg) => {
	console.error(`viewer-lite smoke: ${msg}`)
	process.exitCode = 1
}

const browser = await chromium.launch()
try {
	const page = await browser.newPage()
	const errors = []
	page.on("pageerror", (e) => errors.push(e.message))
	await page.setContent(template.replace("{{BPMN}}", fixture("sample-order-process")))
	const shapes = await page.locator(".bpmn-lite svg g").count()
	if (shapes === 0) fail("template drew no shapes")
	const svg = page.locator(".bpmn-lite svg")
	const before = await svg.getAttribute("viewBox")
	const box = await svg.boundingBox()
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
	await page.mouse.wheel(0, -200)
	const zoomed = await svg.getAttribute("viewBox")
	await page.mouse.down()
	await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2)
	await page.mouse.up()
	const panned = await svg.getAttribute("viewBox")
	if (zoomed === before || panned === zoomed)
		fail(`pan/zoom did not change the viewBox (${before})`)
	if (errors.length) fail(`page errors: ${errors.join("; ")}`)

	const names = readdirSync(FIXTURES).filter((n) => existsSync(join(FIXTURES, n, "input.bpmn")))
	for (const n of names) {
		const xml = fixture(n)
		const lite = await page.evaluate((x) => globalThis.BpmnLite.parseBpmnLite(x), xml)
		if (exportSvg(lite) !== exportSvg(Bpmn.parse(xml)))
			fail(`${n}: SVG differs from the core parser's`)
	}
	console.log(`viewer-lite smoke: template ok (${shapes} groups), ${names.length} fixtures match`)
} finally {
	await browser.close()
}
