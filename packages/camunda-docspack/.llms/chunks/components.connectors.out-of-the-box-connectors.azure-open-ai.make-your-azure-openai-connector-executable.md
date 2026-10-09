# Azure OpenAI connector — Make your Azure OpenAI connector executable

To work with the **Azure OpenAI connector**, fill all mandatory fields.


## Authentication

Fill the **API key** field with a valid Azure OpenAI API key.
[Learn more](https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart?tabs=command-line%2Cpython-new&pivots=rest-api#retrieve-key-and-endpoint) about obtaining a key.

### Create a new connector secret

Keep your **API key** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets).
2. Name your secret (for example, `AZURE_OAI_SECRET`) so you can reference it later in the connector.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/azure-open-ai
