# Connector SDK

The Connector SDK allows you to develop custom connectors using Java code. Focus on the logic of the connector, test it locally, and reuse its runtime logic.

The **Connector SDK** allows you to [develop custom connectors](#creating-a-custom-connector)
using Java code.

You can focus on the logic of the connector, test it locally, and
reuse its runtime logic in multiple [runtime environments](#runtime-environments). The SDK achieves this by abstracting from
Camunda 8 internals that usually come with
[job workers](https://docs.camunda.io/docs/next/components/concepts/job-workers).

You can find the latest **Connector SDK** version source code [here](https://github.com/camunda/connectors).

The SDK provides APIs for common connector operations, such as:

- Fetching and deserializing input data
- Validating input data
- Replacing secrets in input data

Additionally, the SDK allows for convenient [testing](#testing) of your connector behavior and
[executing it in the environments](#runtime-environments) that suit your use cases best.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk
