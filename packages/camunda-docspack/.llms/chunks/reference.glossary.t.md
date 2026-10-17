# Glossary — T

### Tenant

A [Logical Tenant](#logical-tenant) is a logically isolated space within a shared Camunda 8 installation, with its own data, configurations, and user permissions. For strong physical isolation, see [Physical Tenant](#physical-tenant).

- [Tenant management](https://docs.camunda.io/docs/next/components/admin/tenant)
- [Multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy)
- [Logical Tenant](#logical-tenant)
- [Physical Tenant](#physical-tenant)

### Tenant-scoped operation

An operation that targets a specific [Physical Tenant](#physical-tenant), such as deploying a process to a tenant, backing up a tenant's data, or querying a tenant's process instances.

- [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants)

### Telemetry data

Technical and usage information that Camunda collects about how its products are operated and used. Camunda uses telemetry data to evaluate contractual usage, enhance the user experience, and improve its products.

Depending on the source, telemetry data may include deployment and version information, aggregated usage metrics, process metadata, SaaS application usage, and, in limited instances, personal data such as account or cookie identifiers and a SaaS user's name and email address.

- [Data collection](https://docs.camunda.io/docs/next/reference/data-collection/data-collection)

### Temperature

A parameter that regulates the randomness or creativity of AI-generated text. Lower values result in more focused and predictable responses, while higher values lead to more creative and varied outputs.

### Token (AI)

The smallest unit of text such as a word, subword, or character, that a language model processes. Models read and generate text as a sequence of tokens. Often, pricing for AI models is based on the number of input/output tokens.

### Token (process instance)

In the context of a running process instance in Camunda, a token represents the current point of execution within the BPMN process model. You can think of it as a marker that moves through the process diagram, following the sequence flows as tasks and events are completed.

When a process starts, a token is created at the start event and advances with each completed step. Once the token reaches the end event, it is consumed and the process instance ends. Tokens are not data themselves, but they determine which elements of the process are currently active.

---
Source: https://docs.camunda.io/docs/next/reference/glossary
