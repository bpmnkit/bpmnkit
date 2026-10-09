# Configure IDP — Configure IDP — Add OpenAI Compatible provider secrets to cluster {#openai-compatible-secrets}

If you are using an OpenAI Compatible provider, add the following connector secrets required for IDP.

| Connector secret Key             | Required | Description                                                                                                                                                                                                                                      |
| :------------------------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IDP_OPENAI_COMPATIBLE_ENDPOINT` | Yes      | The base URL where IDP can call the chat completions request. This should be the endpoint for your OpenAI Compatible provider's API.                                                                                                             |
| `IDP_OPENAI_COMPATIBLE_HEADERS`  | Yes      | Authentication headers for your OpenAI Compatible provider. If no authentication is required, use `{}`. For providers requiring authentication, include the necessary headers in JSON format (e.g., `{"Authorization": "Bearer your-api-key"}`). |

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-configuration
