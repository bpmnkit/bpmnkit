/**
 * Example 07 — Support ticket triage with a decision model
 *
 * Demonstrates:
 * - The "Cloudflare Clef Decision" element template from @bpmnkit/connectors
 * - Asking a decision model three typed questions (yes/no, choice, score)
 * - Routing an exclusive gateway on the answers and their probabilities
 * - Sending a low-confidence decision to a person instead of guessing
 *
 * Clef returns bounded answers with calibrated probabilities rather than
 * generated text, so a gateway can branch on them directly — no parsing, and
 * no second model call to check the first.
 */

import { mkdirSync, writeFileSync } from "node:fs"
import { applyConnectorTemplate } from "@bpmnkit/connectors"
import { Bpmn } from "@bpmnkit/core"

const triage = applyConnectorTemplate("io.bpmnkit.connectors.CloudflareClef.v1", {
	model: "clef-flash",
	"body.state": "={subject: ticket.subject, body: ticket.body, plan: customer.plan}",
	"body.questions": `={
		"urgent": {"type": "noul", "instructions": "Is this support request urgent?"},
		"team": {
			"type": "choice",
			"instructions": "Which team should handle this request?",
			"criteria": {
				"billing": "Payments, invoices and refunds",
				"technical": "Outages, errors and configuration",
				"sales": "Plans and upgrades"
			}
		},
		"severity": {
			"type": "score",
			"instructions": "How severe is the customer impact?",
			"criteria": ["No impact", "Minor", "Major", "Critical"]
		}
	}`,
})

if (triage.problems.length > 0 || !triage.serviceTask) {
	throw new Error(triage.problems.map((p) => p.message).join("\n"))
}

const definitions = Bpmn.createProcess("TicketTriage")
	.withAutoLayout()
	.name("Support Ticket Triage")
	.versionTag("1.0.0")

	.startEvent("start", { name: "Ticket Received" })

	// One call, three answers — stored as `clef.urgent`, `clef.team`, `clef.severity`
	.serviceTask("triage", { ...triage.serviceTask, name: "Triage Ticket" })

	.exclusiveGateway("route", { name: "Route Ticket" })

	// Conditions are evaluated in order: an incident beats a confidence check.
	.branch("incident", (b) =>
		b
			.condition('=clef.team.choice = "technical" and clef.urgent.noul >= 0.8')
			.serviceTask("pageOncall", {
				name: "Page On-Call",
				taskType: "pagerduty-alert",
				ioMapping: { inputs: [{ source: "=clef.severity.score", target: "severity" }] },
			})
			.endEvent("endPaged", { name: "On-Call Paged" }),
	)

	.branch("unsure", (b) =>
		b
			.condition("=clef.team.confidence < 0.6")
			.userTask("manualTriage", { name: "Triage by Hand", formId: "manual-triage-form" })
			.endEvent("endManual", { name: "Triaged by Hand" }),
	)

	.branch("billing", (b) =>
		b
			.condition('=clef.team.choice = "billing"')
			.serviceTask("billingQueue", { name: "Queue for Billing", taskType: "billing-queue" })
			.endEvent("endBilling", { name: "Queued for Billing" }),
	)

	.branch("other", (b) =>
		b
			.defaultFlow()
			.serviceTask("supportQueue", {
				name: "Queue for Support",
				taskType: "support-queue",
				ioMapping: { inputs: [{ source: "=clef.team.choice", target: "team" }] },
			})
			.endEvent("endSupport", { name: "Queued for Support" }),
	)

	.build()

const xml = Bpmn.export(definitions)

mkdirSync("output", { recursive: true })
writeFileSync("output/07-ai-ticket-triage-clef.bpmn", xml)
console.log("✓ 07-ai-ticket-triage-clef.bpmn")
