# Configuration — Logging

The test runtime uses [SLF4J](https://www.slf4j.org/) as the logging framework. If needed, you can enable the logging
for the following packages:

- `io.camunda.process.test` - The test runtime (recommended level `info`)
- `tc.camunda` - The Camunda Docker container (recommended level `error`)
- `tc.connectors` - The connectors Docker container (recommended level `error`)
- `org.testcontainers` - The Testcontainers framework (recommended level `warn`)


## Judge configuration

[Judge assertions](https://docs.camunda.io/docs/next/apis-tools/testing/assertions#hasvariablesatisfiesjudge) use a configured LLM to score process variables (or plain values) against
natural language expectations. This section covers how to set up the LLM provider and tune the judge behavior.

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
