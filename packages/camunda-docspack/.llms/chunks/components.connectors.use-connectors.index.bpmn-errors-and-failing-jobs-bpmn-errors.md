# How to use connectors — BPMN errors and failing jobs {#bpmn-errors}

Being able to deal with exceptional cases is a common requirement for business process models. Read more about our
general best practices around this topic
in [dealing with problems and exceptions](https://docs.camunda.io/docs/next/components/best-practices/development/dealing-with-problems-and-exceptions).

Connectors share this requirement for exception handling like any other task in a model. However, connectors define
reusable runtime behavior that is not aware of your specific business use case. Thus, they cannot determine if an
exceptional case is a technical or business error.
Therefore, a connector's runtime behavior cannot throw BPMN errors, but only technical errors. However, those technical
errors can optionally contain an error code as structured data that can be reused when configuring a connector task.

**Note**
There may be situations where technical errors cannot be detected by the runtime and they must be thrown explicitly.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
