import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { buildPack } from "../src/build.js"
import { indexPacks, loadPack } from "../src/load.js"
import { search } from "../src/search.js"
import type { DocsIndex } from "../src/search.js"

/**
 * The task-shaped questions an agent asks while writing a Camunda 8 build script, each with the
 * recipe section that answers it. The recipe page used to be missing, and "set a form on a start
 * event" returned a conformance page. Built from the real landing docs with the same options as
 * the shipped pack, so a heading rewrite that costs a question its answer fails here.
 */
const RECIPE = "guides.executable-camunda-process"
const AGENT = `${RECIPE}.how-do-i-build-an-ai-agent-sub-process-with-tools-in-a-bpmn-kit-build-script-8.10-v2`
const CASES: [question: string, chunkId: string][] = [
	["set a form on a start event", `${RECIPE}.how-do-i-put-a-form-on-a-start-event`],
	[
		"apply an element template to a service task",
		`${RECIPE}.how-do-i-apply-an-element-template-connector-to-a-task`,
	],
	["user task input mapping", `${RECIPE}.how-do-i-map-a-user-task-s-input`],
	["AI agent sub-process with tools", AGENT],
	["flow label different from branch", `${RECIPE}.how-do-i-label-a-gateway-s-yes-and-no-flows`],
	["lint before running tests", `${RECIPE}.how-do-i-check-the-file-is-executable-before-tests`],
]

let root: string
let index: DocsIndex
let bothPacks: DocsIndex

beforeAll(() => {
	const here = dirname(fileURLToPath(import.meta.url))
	const config = {
		source: join(here, "../../../apps/landing/src/content/docs"),
		maxTokens: 800,
		minTokens: 120,
	}
	root = mkdtempSync(join(tmpdir(), "docspack-recipe-"))
	mkdirSync(join(root, ".llms"), { recursive: true })
	writeFileSync(
		join(root, "package.json"),
		JSON.stringify({ name: "@bpmnkit/docspack", version: "0.0.0" }),
	)
	buildPack({
		...config,
		packDir: root,
		name: "@bpmnkit/docspack",
		version: "0.0.0",
		documents: ["x"],
	})
	const docs = loadPack(root)
	index = indexPacks([docs])
	// The root CLI indexes the shipped Camunda pack beside this one; its AI Agent chunks compete.
	bothPacks = indexPacks([docs, loadPack(join(here, "../../camunda-docspack"))])
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe("recipe ranking", () => {
	it.each(CASES)("%s -> the recipe section that answers it", (question, chunkId) => {
		const [top] = search(index, question, { limit: 1 })
		expect(top?.chunkId.split("/").pop()).toBe(chunkId)
	})

	it("AI agent sub-process with tools -> the recipe section first, ahead of Camunda's own chunks", () => {
		// `ask` shows the top 3 only; the recipe must lead them with both packs installed.
		const top = search(bothPacks, "AI agent sub-process with tools", { limit: 3 })
		expect(top[0]?.chunkId.split("/").pop()).toBe(AGENT)
	})
})
