# Durable Agent Flows — 1. Write the flow

```typescript
// flows/pr-review.ts
import { writeFileSync } from "node:fs"
import { defineFlow } from "@bpmnkit/flow"

export const review = defineFlow("pr-review", { name: "PR review" })
  .input<{ prKey: string; repo: string }>()
  .run("fetch-diff", async ({ repo, prKey }) => ({ diff: await gh.diff(repo, prKey) }))
  .loop(
    "review-loop",
    (b) => b.agent("review", {
      role: "pr-review",
      prompt: "Review {{repo}} PR {{prKey}}. Start with APPROVE or REJECT, then the problems.\n\n{{diff}}",
      result: "verdict",
    }),
    {
      until: 'starts with(verdict, "APPROVE")',
      max: 3,
      between: (b) => b
        .agent("fix", {
          role: "feature",
          prompt: "In {{repo}}, push fixes to PR {{prKey}} for this review:\n\n{{verdict}}",
        })
        .run("refresh-diff", async ({ repo, prKey }) => ({ diff: await gh.diff(repo, prKey) })),
      escalate: { candidateGroups: "maintainers" },
    },
  )
  .approve("approve-merge", { name: "Approve merge", candidateGroups: "maintainers" })
  .run("merge", async ({ repo, prKey }) => ({ merged: await gh.merge(repo, prKey) }))
  .build()

writeFileSync("pr-review.bpmn", review.toXml())
```

Each step's output joins the variables of the steps after it, so `{{diff}}` in the prompt and
`prKey` in `merge` are checked at compile time. The `.agent()` steps do not run in your code:
they become service tasks with job types `agent:pr-review` and `agent:feature`, which the
workforce serves.

The [loop](/docs/packages/flow#loops) reviews, and while the reviewer's answer does not start
with APPROVE, fixes and reviews again. After three rounds without approval it stops spending tokens and
gives the maintainers a user task instead. The round count lives in the engine like everything
else, so a crash in round 2 resumes in round 2.

---
Source: https://bpmnkit.com/docs/guides/durable-agent-flows
