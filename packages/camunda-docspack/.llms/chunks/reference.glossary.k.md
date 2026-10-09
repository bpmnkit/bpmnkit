# Glossary — K

### Kill switch

A technically and organizationally secured mechanism that can be triggered at any time by authorized personnel to immediately place an AI use case, together with its connected tools and interfaces, into a safe state. This includes stopping ongoing and planned actions, preventing new executions, revoking or blocking access rights, and logging all measures in an auditable manner.

- [AI usage guidelines](https://docs.camunda.io/docs/next/guides/build-with-ai/ai-usage-guidelines#human-oversight)

### Kubernetes Secret

A Kubernetes object that stores small amounts of sensitive data, such as passwords or tokens, separately from Pod specifications and container images. The Camunda Helm chart uses Kubernetes Secrets to supply credentials to Camunda's own components at deployment time.

A Kubernetes Secret can also store and deliver the value behind a [secret reference](#secret-reference): mounted as an environment variable for a [legacy secret reference](#secret-reference-legacy), or as a file in a file-based secret store for an [Orchestration Cluster secret reference](#secret-reference-orchestration-cluster). Either way, the Kubernetes Secret only supplies the value; the [connector runtime](#connector-runtime) or the [Orchestration Cluster](#orchestration-cluster) still resolves the placeholder in the process. A Kubernetes Secret is unrelated to a [SaaS-managed secret](#saas-managed-secret), which supplies values to a SaaS [Orchestration Cluster](#orchestration-cluster) rather than to a Self-Managed component's configuration.

- [Helm charts secret management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
