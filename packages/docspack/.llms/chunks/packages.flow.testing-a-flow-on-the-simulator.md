# @bpmnkit/flow — Testing a flow on the simulator

`definitions()` deploys straight into [`@bpmnkit/engine`](/docs/packages/engine), and each
`run` step exposes its job type and handler:

```typescript
import { Engine } from "@bpmnkit/engine"

const engine = new Engine()
engine.deploy({ bpmn: review.definitions() })
for (const step of review.steps) {
  if (step.kind !== "run") continue
  engine.registerJobWorker(step.jobType, async (job) => {
    job.complete({ ...(await step.handler(job.variables, { jobKey: job.id, processInstanceKey: "1", retries: 3 })) })
  })
}
engine.registerJobWorker("agent:pr-review", (job) => job.complete({ verdict: "approve" }))
```

---
Source: https://bpmnkit.com/docs/packages/flow
