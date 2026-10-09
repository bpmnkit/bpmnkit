# Build a custom connector — Choose your approach

Decide which of the following scenarios best describes your use case.

### Protocol-based API call

You need to call an API that uses a common protocol such as REST, SOAP, or GraphQL.
There is no existing connector on Camunda marketplace that meets your needs.

Camunda recommends using a custom connector template based on the [REST connector](https://docs.camunda.io/docs/next/components/connectors/protocol/rest),
[SOAP connector](https://docs.camunda.io/docs/next/components/connectors/protocol/soap), or [GraphQL connector](https://docs.camunda.io/docs/next/components/connectors/protocol/graphql).
This approach allows you to leverage the existing functionality while customizing it to fit your API requirements.

See [Create a custom REST connector](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/create-connector-from-rest) for more information.

### Complex integration logic

You need to implement integration logic that goes beyond issuing an API call.

Build a custom connector using the [Connector SDK](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk).
This approach gives you full control over the connector's behavior.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/build-connector
