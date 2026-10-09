# Logging — MDC context

Job workers include an MDC context that contains the following:

- `processDefinitionKey`
- `processInstanceKey`
- `elementInstanceKey`
- `jobKey`

See [the example above](#configuration), which includes `%X` in the pattern to print the entire MDC context.

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/logging
