# AI Decisions — Test the routing

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

---
Source: https://bpmnkit.com/docs/guides/ai-decisions
