# Conceptual differences — Architectural differences — Different connector infrastructure

Through Camunda Connect, Camunda 7 provides an HTTP and a SOAP HTTP [Connector](https://docs.camunda.org/manual/latest/reference/connect/). Camunda 8 offers multiple [Connectors](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview) out-of-the-box on a completely different codebase.

To migrate existing connectors, consider the following options:

- Use the [REST protocol connector](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/components/connectors/protocol/rest) to leverage an out-of-the-box connector.
- Create a small bridging layer via custom [job workers](https://docs.camunda.io/docs/next/components/concepts/job-workers).

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences
