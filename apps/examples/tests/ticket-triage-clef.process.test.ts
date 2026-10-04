import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import "@bpmnkit/engine/testing/vitest"
import { createProcessTest } from "@bpmnkit/engine/testing"
import type { ProcessTest } from "@bpmnkit/engine/testing"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

/**
 * Tests for the process example 07 builds. The Clef call runs on the REST
 * connector, so its job type is mocked with what the template's result
 * expression would leave behind: the answers, keyed by question id.
 */

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src")
const REST_CONNECTOR = "io.camunda:http-json:1"

let t: ProcessTest
let xml: string

beforeAll(async () => {
	const cwd = process.cwd()
	const workDir = mkdtempSync(join(tmpdir(), "bpmnkit-process-test-"))
	process.chdir(workDir)
	try {
		await import(join(SRC, "07-ai-ticket-triage-clef.ts"))
		xml = readFileSync(join(workDir, "output", "07-ai-ticket-triage-clef.bpmn"), "utf-8")
		t = await createProcessTest({ bpmn: xml })
	} finally {
		process.chdir(cwd)
		rmSync(workDir, { recursive: true, force: true })
	}

	t.mockJob("pagerduty-alert", { result: {} })
	t.mockJob("billing-queue", { result: {} })
	t.mockJob("support-queue", { result: {} })
})

afterAll(() => t.dispose())

/** Start a ticket whose Clef answers are `team` (with `confidence`) and an urgency of `urgent`. */
function triage(team: string, confidence: number, urgent: number) {
	t.mockJob(REST_CONNECTOR, {
		result: {
			clef: {
				urgent: { type: "noul", noul: urgent },
				team: { type: "choice", choice: team, probabilities: {}, confidence },
				severity: { type: "score", score: 2.4, legend: {}, probabilities: {}, confidence: 0.7 },
			},
		},
	})
	return t.start("TicketTriage", {
		ticket: { subject: "Checkout broken", body: "Every payment fails since 10:00" },
		customer: { plan: "enterprise" },
	})
}

describe("support ticket triage with Clef", () => {
	it("writes the template onto the triage task", () => {
		expect(xml).toContain('modelerTemplate="io.bpmnkit.connectors.CloudflareClef.v1"')
		expect(xml).toContain("/ai/run/@cf/cloudflare/clef-flash")
	})

	it("pages on-call for an urgent technical ticket", async () => {
		const run = await triage("technical", 0.9, 0.95)
		expect(run).toHaveCompleted()
		expect(run).toHavePassed(["triage", "route", "pageOncall", "endPaged"])
	})

	it("hands a low-confidence decision to a person", async () => {
		const run = await triage("billing", 0.41, 0.2)
		expect(run).toBeWaitingAt("manualTriage")
		expect(run).toHaveNotPassed(["billingQueue"])
	})

	it("queues a confident billing ticket for billing", async () => {
		const run = await triage("billing", 0.88, 0.1)
		expect(run).toHaveCompleted()
		expect(run).toHavePassed(["billingQueue", "endBilling"])
	})

	it("sends everything else to the support queue", async () => {
		const run = await triage("sales", 0.8, 0.1)
		expect(run).toHaveCompleted()
		expect(run).toHavePassed(["supportQueue", "endSupport"])
	})
})
