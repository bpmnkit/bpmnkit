# AI Decisions — Example: triage a support ticket

This process asks the three questions above about a ticket. It pages on-call for an urgent
technical ticket. It sends a ticket to a person when the model is not sure which team should
have it. It queues the remaining tickets by team. The full source is
`apps/examples/src/07-ai-ticket-triage-clef.ts`.

```typescript
import { applyConnectorTemplate } from "@bpmnkit/connectors"
import { Bpmn } from "@bpmnkit/core"

const triage = applyConnectorTemplate("io.bpmnkit.connectors.CloudflareClef.v1", {
  model: "clef-flash",
  "body.state": "={subject: ticket.subject, body: ticket.body, plan: customer.plan}",
  "body.questions": QUESTIONS, // the FEEL context above
})
if (triage.problems.length > 0 || !triage.serviceTask) throw new Error(triage.problems[0]?.message)

const definitions = Bpmn.createProcess("TicketTriage")
  .withAutoLayout()
  .startEvent("start", { name: "Ticket Received" })
  .serviceTask("triage", { ...triage.serviceTask, name: "Triage Ticket" })
  .exclusiveGateway("route", { name: "Route Ticket" })
  .branch("incident", (b) =>
    b
      .condition('=clef.team.choice = "technical" and clef.urgent.noul >= 0.8')
      .serviceTask("pageOncall", { name: "Page On-Call", taskType: "pagerduty-alert" })
      .endEvent("endPaged"),
  )
  .branch("unsure", (b) =>
    b
      .condition("=clef.team.confidence < 0.6")
      .userTask("manualTriage", { name: "Triage by Hand", formId: "manual-triage-form" })
      .endEvent("endManual"),
  )
  .branch("billing", (b) =>
    b
      .condition('=clef.team.choice = "billing"')
      .serviceTask("billingQueue", { name: "Queue for Billing", taskType: "billing-queue" })
      .endEvent("endBilling"),
  )
  .branch("other", (b) =>
    b
      .defaultFlow()
      .serviceTask("supportQueue", { name: "Queue for Support", taskType: "support-queue" })
      .endEvent("endSupport"),
  )
  .build()

const xml = Bpmn.export(definitions)
```

The exclusive gateway takes the first flow whose condition is true, in the order above. An
urgent incident is paged even when the team answer is not certain.

Set the confidence threshold from your own data. Start with a value that sends a good share of
tickets to a person. Look at what the people decide, then lower the threshold.

---
Source: https://bpmnkit.com/docs/guides/ai-decisions
