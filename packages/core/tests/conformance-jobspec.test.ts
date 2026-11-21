import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { extractProcessContract } from "../src/bpmn/process-types.js"

/**
 * conformance/jobspec/jobs.json: the job list `casen gen types` reads (`extractProcessContract`) for
 * every `conformance/bpmn/<case>/input.bpmn`. `crates/bpmnkit-jobspec` must extract the same job
 * types, elements, headers and catchable error codes. See conformance/README.md, "Jobspec".
 */

const RECORD = process.env.CONFORMANCE_RECORD === "1"
const repo = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const bpmnRoot = path.join(repo, "conformance/bpmn")
const target = path.join(repo, "conformance/jobspec/jobs.json")

function record(): string {
	const cases = fs
		.readdirSync(bpmnRoot, { withFileTypes: true })
		.filter((d) => d.isDirectory() && fs.existsSync(path.join(bpmnRoot, d.name, "input.bpmn")))
		.map((d) => d.name)
		.sort()
	const out: Record<string, unknown> = {}
	for (const name of cases) {
		const xml = fs.readFileSync(path.join(bpmnRoot, name, "input.bpmn"), "utf8")
		const contract = extractProcessContract(parseBpmn(xml))
		out[name] = {
			jobs: contract.jobs.map((job) => ({
				type: job.type,
				elements: job.elements.map((e) => `${e.processId}#${e.elementId}#${e.elementType}`),
				headers: job.headers,
				errors: job.errors,
			})),
			dynamic: contract.dynamicJobTypes.map((e) => `${e.processId}#${e.elementId}`),
		}
	}
	return `${JSON.stringify(out, null, 2)}\n`
}

describe("conformance/jobspec", () => {
	it("jobs.json", () => {
		const json = record()
		if (RECORD) fs.writeFileSync(target, json)
		expect(json).toBe(fs.readFileSync(target, "utf8"))
	})
})
