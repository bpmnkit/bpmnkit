---
title: AI Decisions
description: Route a Camunda 8 process on a Cloudflare Clef decision model — typed yes/no, choice and score answers with calibrated probabilities, through one element template.
sidebar:
  order: 11
---

An [AI agent](/docs/guides/ai-agents) writes text and decides which tools to call. Often a
process step needs less than that: one bounded answer that a gateway can branch on. Which team
gets this ticket? Is this request urgent? How bad is the impact?

A **decision model** answers exactly that kind of question. Cloudflare's
[Clef](https://blog.cloudflare.com/clef-decision-models/) models do not generate text. They
score the options you define in one pass and return a typed answer with a probability for each
option. A gateway can then route on the answer, and route on how sure the model is.

| Step needs | Use |
|---|---|
| Fixed rules over known inputs | A DMN decision (business rule task) |
| A judgement over free text, images or messy data, with a bounded answer | **A decision model** (this guide) |
| Open-ended work: write, research, call tools in a loop | An [AI Agent](/docs/guides/ai-agents) |

## The template

`@bpmnkit/connectors` bundles **Cloudflare Clef Decision**
(`io.bpmnkit.connectors.CloudflareClef.v1`). It is an element template for a service task that
runs on Camunda's REST connector (`io.camunda:http-json:1`), so any cluster with the connector
runtime can run it. You do not deploy a job worker.

| Field | Key | Notes |
|---|---|---|
| API token | `authentication.token` | Default `{{secrets.CLOUDFLARE_API_TOKEN}}`. Needs Workers AI permission. |
| Account ID | `accountId` | Default `{{secrets.CLOUDFLARE_ACCOUNT_ID}}`. |
| Model | `model` | `clef` (more accurate, has a vision encoder) or `clef-flash` (lower latency). Sets the URL and the body's `model` together. |
| State | `body.state` | Required. FEEL. What the model evaluates: text, or a context or list. |
| Questions | `body.questions` | Required. FEEL context of 1 to 64 questions, keyed by id. |
| Images | `body.images` | Optional. FEEL list of up to 4 base64 data URLs (PNG, JPEG, WebP). |
| Result expression | `resultExpression` | Default `={clef: response.body.result.answers}`. |

Before you deploy, create the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in the
cluster's connector secrets.

## Questions and answers

Each question has a `type` and `instructions`. Answers come back under the same ids. With the
default result expression, the answer to question `team` is in `clef.team`.

| Type | `criteria` | Answer |
|---|---|---|
| `noul` (yes/no) | Optional `{"true": …, "false": …}` | `noul`: probability of yes, 0 to 1 |
| `choice` | Required. Context of 2 to 255 options: id → description | `choice`: the option id. `probabilities` per option. `confidence`. |
| `score` | Required. List of 2 to 10 levels, lowest first | `score`: probability-weighted level from 0, can fall between levels. `legend`, `probabilities`, `confidence`. |

```feel
={
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
}
```

The answers for these questions look like this:

```json
{
  "urgent": { "type": "noul", "noul": 0.94 },
  "team": {
    "type": "choice",
    "choice": "technical",
    "probabilities": { "billing": 0.06, "technical": 0.91, "sales": 0.03 },
    "confidence": 0.88
  },
  "severity": {
    "type": "score",
    "score": 2.7,
    "legend": { "0": "No impact", "1": "Minor", "2": "Major", "3": "Critical" },
    "probabilities": { "0": 0.01, "1": 0.04, "2": 0.2, "3": 0.75 },
    "confidence": 0.71
  }
}
```

## Example: triage a support ticket

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

## Test the routing

In a test, mock the REST connector's job type with the variables that the result expression
writes. You can then test each branch without a call to Cloudflare:

```typescript
import { createProcessTest } from "@bpmnkit/engine/testing"

const t = await createProcessTest({ bpmn: xml })
t.mockJob("io.camunda:http-json:1", {
  result: {
    clef: {
      urgent: { type: "noul", noul: 0.2 },
      team: { type: "choice", choice: "billing", probabilities: {}, confidence: 0.41 },
      severity: { type: "score", score: 1, legend: {}, probabilities: {}, confidence: 0.8 },
    },
  },
})
const run = await t.start("TicketTriage", { ticket: { subject: "Refund", body: "…" } })
// run is waiting at "manualTriage"
```

`apps/examples/tests/ticket-triage-clef.process.test.ts` tests all four branches.

## Use the template in the editor

In the BPMN Kit [editor](/editor), select a service task and pick **Cloudflare Clef Decision**
in the **Connector** list. The panel then shows the template's fields.

## Use the template in Camunda Modeler

To use the template in Desktop Modeler or Web Modeler, write it to a JSON file:

```typescript
import { writeFileSync } from "node:fs"
import { getTemplate } from "@bpmnkit/connectors"

const clef = getTemplate("io.bpmnkit.connectors.CloudflareClef.v1")
writeFileSync(".camunda/element-templates/cloudflare-clef.json", JSON.stringify(clef, null, 2))
```

The template is in the **AI decisions** category of the template chooser.

## Limits

These limits are from Cloudflare's model page:

- 1 to 64 questions for each call. A `choice` has 2 to 255 options. A `score` has 2 to 10 levels.
- The context window is 64k tokens. Long text state is truncated to fit.
- Images: 4 at most, 4 MiB each, 8 MiB in total. Data URLs only. Remote URLs are not accepted.
- A failed call (for example HTTP 401 or 429) fails the job. The template's retries and retry
  backoff apply. To raise a BPMN error instead, set the error expression.
