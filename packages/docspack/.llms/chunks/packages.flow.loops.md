# @bpmnkit/flow — Loops

`.loop()` repeats its body until a FEEL condition holds, at most `max` times. Agent work is
mostly loops — review, fix, review again until the reviewer approves — and a loop with a bound
cannot burn tokens forever:

```typescript
defineFlow("pr")
  .input<{ pr: string }>()
  .loop(
    "review-loop",
    (b) => b.agent("review", { role: "pr-review", prompt: "Review {{pr}}. Start with APPROVE or REJECT.", result: "verdict" }),
    {
      until: 'starts with(verdict, "APPROVE")',
      max: 3,
      between: (b) => b.agent("fix", { role: "feature", prompt: "Address this review of {{pr}}:\n{{verdict}}" }),
      escalate: { candidateGroups: "leads" },
    },
  )
  .run("merge", async ({ pr, round }) => ({ merged: await gh.merge(pr, `approved in round ${round}`) }))
  .build()
```

The body and `between` are builders of their own. The body sees the variables from before the
loop plus the counter; `between` also sees what the body added; the flow after the loop sees
what the body added. Each round:

1. runs the body,
2. adds 1 to the counter (`round` unless you name another; it is 0 when the loop starts),
3. ends the loop if `until` holds — otherwise, if `max` rounds are done, gives a person the
   `escalate` user task and ends the loop after it; otherwise runs `between` and another round.

So a PR approved on the first review is never "fixed", and after the third rejection the next
step is a person, not a fourth agent run.

| Option | Default | Description |
|---|---|---|
| `until` | — (required) | FEEL condition, with or without a leading `=`. It must evaluate to `true` or `false` |
| `max` | — (required) | Rounds before a person is asked. A whole number, at least 1 |
| `counter` | `"round"` | Variable counting the rounds done. A loop inside another needs its own |
| `name` | the id | Label on the loop's gateway |
| `between` | — | `(b) => b…` — steps run only when another round follows |
| `escalate` | — | `{ name?, assignee?, candidateGroups? }` for the user task at `max` |

In BPMN a loop is ordinary elements, so it opens in any modeler: a script task `<id>-start`
sets the counter to 0, the exclusive gateway `<id>` joins the first round and the repeats,
the body follows, the script task `<id>-next` counts the round, and the exclusive gateway
`<id>-check` leaves to `<id>-end` (done), to the user task `<id>-escalate` (gave up), or —
its default flow — through the `between` steps back to `<id>`. Those ids are taken, like step
ids.

---
Source: https://bpmnkit.com/docs/packages/flow
