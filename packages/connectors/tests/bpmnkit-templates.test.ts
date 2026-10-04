import { describe, expect, it } from "vitest"
import {
	BPMNKIT_CONNECTOR_TEMPLATES,
	applyConnectorTemplate,
	getTemplate,
	searchConnectors,
	validateElementTemplate,
} from "../src/index.js"

const CLEF = "io.bpmnkit.connectors.CloudflareClef.v1"

const QUESTIONS = `={
	"team": {
		"type": "choice",
		"instructions": "Which team should handle this request?",
		"criteria": {"billing": "Payments, invoices and refunds", "technical": "Outages, errors and configuration"}
	},
	"urgent": {"type": "noul", "instructions": "Is this support request urgent?"}
}`

function urlOf(inputs: Array<{ source: string; target: string }>): string | undefined {
	return inputs.find((i) => i.target === "url")?.source
}

describe("BPMN Kit templates", () => {
	it("are valid element templates with no warnings", () => {
		for (const template of BPMNKIT_CONNECTOR_TEMPLATES) {
			expect(validateElementTemplate(template), template.id).toEqual({
				valid: true,
				problems: [],
				warnings: [],
			})
		}
	})

	it("join the catalogue next to Camunda's", () => {
		expect(getTemplate(CLEF)?.name).toBe("Cloudflare Clef Decision")
		expect(searchConnectors("clef decision")[0]?.id).toBe(CLEF)
	})
})

describe("Cloudflare Clef Decision", () => {
	it("posts to the REST connector with the account id ahead of the URL that reads it", () => {
		const result = applyConnectorTemplate(CLEF, {
			"body.state": "=ticket.description",
			"body.questions": QUESTIONS,
		})
		expect(result.problems).toEqual([])
		expect(result.serviceTask?.taskType).toBe("io.camunda:http-json:1")

		const inputs = result.serviceTask?.ioMapping?.inputs ?? []
		expect(inputs).toContainEqual({ source: "POST", target: "method" })
		expect(inputs).toContainEqual({ source: "bearer", target: "authentication.type" })
		expect(inputs).toContainEqual({ source: "clef", target: "body.model" })
		expect(urlOf(inputs)).toMatch(/\/ai\/run\/@cf\/cloudflare\/clef"$/)
		expect(inputs.filter((i) => i.target === "url")).toHaveLength(1)

		const targets = inputs.map((i) => i.target)
		expect(targets.indexOf("cloudflareAccountId")).toBeLessThan(targets.indexOf("url"))

		expect(result.serviceTask?.taskHeaders).toMatchObject({
			resultExpression: "={clef: response.body.result.answers}",
		})
	})

	it("keeps the URL path and the body's model in step for clef-flash", () => {
		const result = applyConnectorTemplate(CLEF, {
			model: "clef-flash",
			"body.state": "=ticket.description",
			"body.questions": QUESTIONS,
		})
		const inputs = result.serviceTask?.ioMapping?.inputs ?? []
		expect(inputs).toContainEqual({ source: "clef-flash", target: "body.model" })
		expect(urlOf(inputs)).toMatch(/\/ai\/run\/@cf\/cloudflare\/clef-flash"$/)
		expect(inputs.filter((i) => i.target === "url")).toHaveLength(1)
	})

	it("sends images only when given", () => {
		const images = '=["data:image/png;base64,iVBORw0KGgo="]'
		const without = applyConnectorTemplate(CLEF, {
			"body.state": "=ticket",
			"body.questions": QUESTIONS,
		})
		expect(without.serviceTask?.ioMapping?.inputs).not.toContainEqual(
			expect.objectContaining({ target: "body.images" }),
		)

		const withImages = applyConnectorTemplate(CLEF, {
			"body.state": "=ticket",
			"body.questions": QUESTIONS,
			"body.images": images,
		})
		expect(withImages.problems).toEqual([])
		expect(withImages.serviceTask?.ioMapping?.inputs).toContainEqual({
			source: images,
			target: "body.images",
		})
	})

	it("requires the state and the questions", () => {
		const result = applyConnectorTemplate(CLEF, {})
		const missing = result.problems.filter((p) => p.kind === "missing-required").map((p) => p.key)
		expect(missing).toEqual(["body.state", "body.questions"])
	})
})
