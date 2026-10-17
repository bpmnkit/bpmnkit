# Glossary — L

### Large language model (LLM)

A large language model (LLM) is a type of AI program specifically designed to understand and generate human-like text. These models are trained on massive amounts of text data, enabling them to learn the structure of language and perform a variety of tasks, such as conversation, summarization, and code generation.

### Leader

In a clustered environment, one [broker](#zeebe-broker) (the [leader](#leader)) is responsible for process execution and housekeeping of data within a [partition](#partition). Housekeeping includes taking [snapshots](#snapshot), [replication](#replication), and running [exports](#zeebe-exporter).

- [Clustering](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering#raft-consensus-and-replication-protocol)

### Log

The log is comprised of an ordered sequence of records written to persistent storage. The log is appended-only and is stored on disk within the broker.

- [Partitions](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/partitions#partition-data-layout)

### Logical Tenant

A [Logical Tenant](#logical-tenant) is an existing, lightweight tenant-ID based multi-tenancy model in Camunda 8. Logical Tenants provide data isolation through tenant identifiers (stored in the `tenantId` field) but share infrastructure with other Logical Tenants. Multiple Logical Tenants can coexist within a single [Physical Tenant](#physical-tenant).

- [Multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy)
- [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants)

### Loop iteration

A loop iteration is one pass through an [AI agent](#ai-agent)’s [agent loop](#agent-loop), during which the model reasons, selects tools, evaluates the result, and decides whether to continue. An AI agent run consists of one loop with one or more loop iterations.

Camunda groups an agent's conversation history by loop iteration in Operate, making it easier to reference a specific point in an agent's execution. Operate's UI labels each entry simply as `iteration` as shorthand for loop iteration.

- [Conversation history and loop iterations](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances#conversation-history-and-loop-iterations)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
