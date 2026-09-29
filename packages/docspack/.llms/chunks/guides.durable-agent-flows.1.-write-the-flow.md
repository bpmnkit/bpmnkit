# Durable Agent Flows — 1. Write the flow

```typescript
// flows/pr-review.ts
import { writeFileSync } from "node:fs"
import { defineFlow } from "@bpmnkit/flow"

export const review = defineFlow("pr-review", { name: "PR review" })
  .input<{ prKey: string; repo: string }>()
  .run("fetch-diff", async ({ repo, prKey }) => ({ diff: await gh.diff(repo, prKey) }))
  .agent("review", {
    role: "pr-review",
    prompt: "You are reviewing {{repo}} PR {{prKey}}. Reply APPROVE or list the problems.\n\n{{diff}}",
    result: "verdict",
  })
  .approve("approve-merge", { name: "Approve merge", candidateGroups: "maintainers" })
  .run("merge", async ({ repo, prKey }) => ({ merged: await gh.merge(repo, prKey) }))
  .build()

writeFileSync("pr-review.bpmn", review.toXml())
```

Each step's output joins the variables of the steps after it, so `{{diff}}` in the prompt and
`prKey` in `merge` are checked at compile time. The `.agent()` step does not run in your code:
it becomes a service task with job type `agent:pr-review`, which the workforce serves.

---
Source: https://bpmnkit.com/docs/guides/durable-agent-flows
