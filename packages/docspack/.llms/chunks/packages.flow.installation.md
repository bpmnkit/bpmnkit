# @bpmnkit/flow — Installation

```sh
npm install @bpmnkit/flow
```


## Quick start

```typescript
import { writeFileSync } from "node:fs"
import { defineFlow } from "@bpmnkit/flow"

const review = defineFlow("pr-review", { name: "PR review" })
  .input<{ prKey: string }>()
  .run("fetch-diff", async ({ prKey }) => ({ diff: await gh.diff(prKey) }))
  .agent("review", { role: "pr-review", prompt: "Review this diff:\n{{diff}}", result: "verdict" })
  .waitFor("ci-green", { correlationKey: "prKey" })
  .approve("approve-merge", { candidateGroups: "maintainers" })
  .run("merge", async ({ prKey, verdict }) => ({ merged: await gh.merge(prKey, verdict) }))
  .build()

writeFileSync("pr-review.bpmn", review.toXml()) // deploy with `casen deploy deploy pr-review.bpmn`
const worker = review.worker() // serves fetch-diff and merge
```

---
Source: https://bpmnkit.com/docs/packages/flow
