# Durable Agent Flows

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

---
Source: https://bpmnkit.com/docs/guides/durable-agent-flows
