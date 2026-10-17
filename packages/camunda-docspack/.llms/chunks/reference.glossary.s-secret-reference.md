# Glossary — S — Secret reference

A placeholder written into a [process](#process) model that stands in for a secret value, used in a [connector](#connector) field, an input mapping, or a [cluster variable](#cluster-variable). Camunda resolves a secret reference to its value at runtime instead of storing the value in the process itself.

Camunda 8 supports two secret reference syntaxes, which are resolved by different components and are not interchangeable:

- The [legacy secret reference](#secret-reference-legacy) syntax, `{{secrets.<name>}}`
- The [Orchestration Cluster secret reference](#secret-reference-orchestration-cluster) syntax, `camunda.secrets.<name>`

A [Kubernetes Secret](#kubernetes-secret) can back either secret reference syntax as the underlying storage and delivery mechanism. What differs between the two syntaxes is which component resolves the placeholder, not whether a Kubernetes Secret is involved.

- [Secret resolution and job activation](https://docs.camunda.io/docs/next/components/concepts/secret-resolution-and-job-activation)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
