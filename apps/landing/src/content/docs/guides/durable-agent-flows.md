---
title: Durable Agent Flows
description: Write a workflow in TypeScript, let coding agents do the steps, and let the engine remember the run across crashes and reboots.
sidebar:
  order: 18
---

When a lead agent keeps its plan in its own context — what is done, what is blocked, what is
next — that plan lives in the most volatile place you have. One compaction and it is gone; one
reboot and the run dies with it, and the tokens are spent again.

A process engine is the durable place for that state. This guide puts the two together:

- **[`@bpmnkit/flow`](/docs/packages/flow)** — you write the workflow as TypeScript steps, and
  it derives the BPMN, the job types and the worker.
- **`casen agent`** — you hire coding-agent CLIs (Claude Code, Copilot, …) as job workers, and
  run them as a workforce.
- **A Camunda 8 engine** — local [Reebe](/docs/cli/casen#local-engine-reebe) or a real cluster —
  holds the run. A crash of any worker costs a job lock, not the run.

## 1. Write the flow

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

## 2. Start an engine and deploy

```sh
casen reebe start --port 26500 --grpc-port 26501   # local engine, SQLite-backed
casen profile create local --base-url http://localhost:26500/v2 --auth-type none
casen profile use local
casen deploy deploy pr-review.bpmn
```

REST goes on 26500 because that is where `casen deploy` and the flow worker look by default
(`ZEEBE_ADDRESS`); Reebe's gRPC gateway, which also defaults to 26500, moves to 26501. Any
Camunda 8 cluster works the same way — point the profile and `ZEEBE_ADDRESS` at it instead.

## 3. Hire the workforce

A hire saves a profile: the CLI to run, the roles it takes on, and how many jobs it works on at
once. Everything after `--` is the command.

```sh
casen agent hire claude --roles pr-review,plan --rank senior -- claude -p
casen agent hire copilot --roles feature --instances 3 -- copilot -p "{prompt}"
casen agent list
```

The prompt goes to the CLI on stdin, unless an argument contains `{prompt}` — then it goes
there. Profiles are saved in `workforce.json`, next to casen's profile config.

| Flag | Default | Description |
|---|---|---|
| `--roles` | — (required) | Comma-separated roles the agent takes on |
| `--rank` | — | Also serve steps that ask for this rank |
| `--instances` | `1` | How many jobs the agent works on at once |
| `--timeout` | `30` | Minutes one run may take before it is stopped and the job failed |
| `--cwd` | current directory | Directory the CLI runs in |

`casen agent hire` with an existing name updates that agent; `casen agent fire <name>` removes
it.

### Roles and ranks

An `.agent()` step names a role and, optionally, a rank:

| Step | Job type | Served by |
|---|---|---|
| `{ role: "pr-review" }` | `agent:pr-review` | any agent with the `pr-review` role |
| `{ role: "pr-review", rank: "senior" }` | `agent:senior:pr-review` | only agents hired with `--rank senior` |

Use ranks to route expensive steps to a frontier model and keep the rest on a cheaper or local
one.

## 4. Run it

Your flow's own worker serves the `.run()` steps:

```typescript
// flows/worker.ts
import { review } from "./pr-review.js"

const worker = review.worker() // reads ZEEBE_ADDRESS, default http://localhost:26500
process.on("SIGINT", () => void worker.stop())
await worker.done
```

The workforce serves the `.agent()` steps. Start both, then an instance:

```sh
casen agent work                  # every hired agent, until Ctrl+C
npx tsx flows/worker.ts
casen process-instance create --data '{"processDefinitionId":"pr-review","variables":{"repo":"acme/api","prKey":"42"}}'
```

For each job, the workforce renders the task's prompt with the instance's variables, runs the
CLI, and completes the job with what the CLI printed, under the step's `result` variable. A
non-zero exit fails the job with the CLI's stderr, and the engine retries it until the task's
retries run out. A prompt that names a missing variable fails the job without retries, because
no retry can fix it.

Stop the workforce with Ctrl+C: jobs in progress are handed back to the engine at once, with
their retries unchanged. If the process dies instead, the engine hands the jobs out again when
their locks expire.

## Durable waits

`.waitFor()` parks the instance on a message, for as long as it takes:

```typescript
  .waitFor("ci-green", { correlationKey: "prKey", message: "ci-passed" })
```

Publish the message when the outside event happens — from a CI webhook, for example:

```sh
casen message publish --data '{"name":"ci-passed","correlationKey":"42"}'
```

Nothing holds a worker, an agent slot or a context window while the instance waits.

## Security

The workforce runs the command you hired with the arguments you gave it. If those arguments let
the agent run tools or skip permission prompts, it can do that on this machine, in `--cwd`.

The prompt it gets is the step's template filled with process variables, and variables come from
whoever can start instances or publish messages on the engine. Only run a workforce against an
engine you trust, give each agent the narrowest tool permissions its role needs, and prefer a
dedicated working directory or container for agents that can write.
