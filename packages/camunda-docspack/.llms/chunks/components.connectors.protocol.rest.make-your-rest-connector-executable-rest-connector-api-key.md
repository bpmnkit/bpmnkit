# REST connector — Make your REST connector executable — REST connector (API key)

For services that require an API key for authentication, you can configure the REST connector to include your API key in the request.

#### Create a new connector secret

We advise you to keep your **API key** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets).
2. Name your secret (i.e `REST_API_KEY_SECRET`) so you can reference it later in the connector.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
