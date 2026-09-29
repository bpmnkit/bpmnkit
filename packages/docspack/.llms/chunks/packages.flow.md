# @bpmnkit/flow

`@bpmnkit/flow` lets you write a durable workflow as a chain of TypeScript steps. From that
one definition it derives the executable BPMN process, a job type for every step, the message
correlation of every wait, and a worker that serves the handler steps. The model and the code
cannot drift apart, because there is only one of them.

The engine holds the run state, not your process. An instance survives a crash or a reboot and
continues at the step it reached. That makes a flow a good home for agent work: an LLM decides
what to do, and the engine remembers what is done. See
[Durable Agent Flows](/docs/guides/durable-agent-flows) for the end-to-end guide.

The package is [Experimental](/docs/getting-started/stability#product-tiers).

---
Source: https://bpmnkit.com/docs/packages/flow
