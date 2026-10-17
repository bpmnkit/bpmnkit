# Glossary — H

### Hallucination

When an AI confidently produces incorrect or fabricated information that seems plausible. It reflects the model’s tendency to produce patterns that appear coherent but lack factual accuracy.

### H2

H2 is a lightweight relational database engine used as a secondary storage backend for local development and evaluation in Camunda.

H2 can run in two modes:

- **In-memory**: Data is stored only in memory and lost when the application stops. Useful for temporary testing.
- **File-based (embedded)**: Database files are persisted to disk on the same host as the component using them. Suitable for local development where data persistence across restarts is needed.

H2 is not intended for production usage. For Camunda secondary storage, H2 is a single-broker option and is not a valid backend for multi-broker clusters.

- [Secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index)

See also: [Secondary storage](#secondary-storage)

### Human-in-the-Loop (HITL)

A human review and approval step before AI-generated outputs with legal, financial, or safety-relevant effects are acted upon.

### Human task

Camunda 8 allows you to orchestrate processes with human tasks, which may be [user tasks](#user-task) or [manual tasks](#manual-task).

- [Human task orchestration](https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-human-tasks)

### Hybrid mode

Hybrid mode, or a hybrid Self-Managed distribution, allows you to run a separate instance of the [connectors](#connector) runtime in a Self-Managed or local fashion. This instance can be attached to either a SaaS cluster, or another Self-Managed cluster with its own connector runtime.

For example, this is useful when working with services that must be isolated within a private network and cannot be exposed to the public internet, or if infrastructure amendments need to be applied to the connector runtime, such as SSL certificates or mounted volumes.

- [Use connectors in hybrid mode](https://docs.camunda.io/docs/next/components/connectors/use-connectors-in-hybrid-mode)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
