# Glossary — S — Secret reference (Orchestration Cluster)

The `camunda.secrets.<name>` syntax used to reference a secret, written directly in an input mapping or embedded in the value of a [cluster variable](#cluster-variable) that an input mapping reads. Unlike a [legacy secret reference](#secret-reference-legacy), the [Orchestration Cluster](#orchestration-cluster) itself resolves this reference through [secret resolution](#secret-resolution), rather than the connector runtime resolving it at execution time.

Resolution only happens in an input mapping defined on an element that creates a job for a job worker, such as a service task or an ad hoc sub-process. In any other FEEL expression (gateway conditions, script tasks, output mappings, call activity input, and so on), the placeholder is not resolved and reaches your process unchanged.

- [Secret resolution and job activation](https://docs.camunda.io/docs/next/components/concepts/secret-resolution-and-job-activation)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
