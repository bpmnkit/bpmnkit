#!/usr/bin/env node
// Opens generated diff viewer pages in Chromium with every network request blocked and checks
// that the page asks for nothing, the view modes and filters work, a click on a change zooms
// both diagrams, and the page still shows highlights and the list with JavaScript off.
//
//   node scripts/diff-viewer-check.mjs [page.html …]   default: conformance/diff/*/expected/diff.html
//
// Needs Playwright with Chromium (not a dependency of the repo; CI images and dev boxes have it).
import { readdirSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const require = createRequire(import.meta.url)
const { chromium } = require("playwright")

const files = process.argv.slice(2).map((f) => resolve(f))
if (files.length === 0) {
	const dir = join(ROOT, "conformance/diff")
	for (const c of readdirSync(dir).sort()) files.push(join(dir, c, "expected/diff.html"))
}

function check(cond, what) {
	if (!cond) throw new Error(what)
}

async function open(browser, file, javaScriptEnabled) {
	const context = await browser.newContext({
		javaScriptEnabled,
		viewport: { width: 1400, height: 900 },
	})
	const url = pathToFileURL(file).href
	const requests = []
	const errors = []
	await context.route("**/*", (route) => {
		const u = route.request().url()
		if (u === url) return route.continue()
		requests.push(u)
		return route.abort()
	})
	const page = await context.newPage()
	page.on("pageerror", (e) => errors.push(e.message))
	page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
	await page.goto(url)
	return { context, page, requests, errors }
}

const visible = (page, sel) => page.locator(sel).first().isVisible()
const viewBoxes = (page) =>
	page.$$eval(".bk-svg", (svgs) => svgs.map((s) => s.getAttribute("viewBox")))

async function withJs(browser, file) {
	const { context, page, requests, errors } = await open(browser, file, true)
	check(await page.evaluate(() => document.body.classList.contains("bk-js")), "script did not run")
	check(await visible(page, ".bk-pane-before"), "side by side: before hidden")
	check(await visible(page, ".bk-pane-after"), "side by side: after hidden")

	await page.click('label[for="bk-m-overlay"]')
	const [b, a] = await Promise.all(
		[".bk-pane-before", ".bk-pane-after"].map((s) => page.locator(s).boundingBox()),
	)
	check(b && a && b.x === a.x && b.y === a.y && b.width === a.width, "overlay: panes not stacked")
	check(await visible(page, ".bk-fade"), "overlay: no opacity slider")
	await page.locator("#bk-fade").fill("80")
	const fade = await page.evaluate(() =>
		getComputedStyle(document.body).getPropertyValue("--bk-fade"),
	)
	check(fade.trim() === "0.8", `slider did not set the fade (${fade})`)

	await page.click('label[for="bk-m-before"]')
	check(!(await visible(page, ".bk-pane-after")), "before mode: after still shown")
	await page.click('label[for="bk-m-after"]')
	check(!(await visible(page, ".bk-pane-before")), "after mode: before still shown")
	await page.click('label[for="bk-m-side"]')

	const rows = await page.locator(".bk-row").count()
	if (rows > 0) {
		// Zoom to a change that has something drawn; some (a lane set, a message) have no geometry.
		const drawn =
			(await page.locator(".bk-hl").count()) > 0
				? await page.locator(".bk-hl").first().getAttribute("data-i")
				: null
		const row = page.locator(drawn === null ? ".bk-row" : `.bk-row[data-i="${drawn}"]`).first()
		const home = (await viewBoxes(page))[0]
		await row.click()
		await page.waitForTimeout(400)
		check(await row.evaluate((r) => r.classList.contains("bk-sel")), "row not selected")
		if (drawn !== null) {
			const after = await viewBoxes(page)
			check(after[0] !== home, "row click did not zoom")
			check(
				after.every((v) => v === after[0]),
				"panes not in sync",
			)
			await page.keyboard.press("0")
			await page.waitForTimeout(400)
			check((await viewBoxes(page))[0] === home, "0 did not fit")
		}

		const hl = page.locator(".bk-pane-after .bk-hl, .bk-pane-before .bk-hl").last()
		if ((await hl.count()) > 0) {
			const i = await hl.getAttribute("data-i")
			await hl.dispatchEvent("click", { bubbles: true })
			const sel = await page.locator(".bk-row.bk-sel").getAttribute("data-i")
			check(sel === i, `highlight click selected row ${sel}, not ${i}`)
		}

		const kind = (await page.locator(".bk-row").first().getAttribute("class")).match(
			/bk-k-(\w+)/,
		)[1]
		await page.click(`label[for="bk-f-${kind}"]`)
		check(!(await visible(page, `.bk-row.bk-k-${kind}`)), `filter ${kind}: rows still shown`)
		await page.click(`label[for="bk-f-${kind}"]`)
	}
	check(requests.length === 0, `network requests: ${requests.join(", ")}`)
	check(errors.length === 0, `errors: ${errors.join("; ")}`)
	await context.close()
}

async function withoutJs(browser, file) {
	const { context, page, requests } = await open(browser, file, false)
	const marks = await page.locator(".bk-hl").count()
	const rows = await page.locator(".bk-row").count()
	// A straight edge has a zero-height box, which Playwright counts as invisible; ask CSS.
	const shown = await page.$$eval(
		".bk-hl",
		(gs) =>
			gs.filter((g) => g.getClientRects().length > 0 || getComputedStyle(g).display !== "none")
				.length,
	)
	if (marks > 0) check(shown === marks, "no JS: highlights hidden")
	check(rows > 0 || (await visible(page, ".bk-empty")), "no JS: no change list")
	await page.click('label[for="bk-m-after"]')
	check(!(await visible(page, ".bk-pane-before")), "no JS: modes do not switch")
	check(requests.length === 0, `no JS: network requests: ${requests.join(", ")}`)
	await context.close()
}

const browser = await chromium.launch()
let failed = 0
for (const file of files) {
	try {
		await withJs(browser, file)
		await withoutJs(browser, file)
		console.log(`ok   ${file.replace(`${ROOT}/`, "")}`)
	} catch (e) {
		failed++
		console.log(`FAIL ${file.replace(`${ROOT}/`, "")}: ${e.message}`)
	}
}
await browser.close()
process.exit(failed > 0 ? 1 : 0)
