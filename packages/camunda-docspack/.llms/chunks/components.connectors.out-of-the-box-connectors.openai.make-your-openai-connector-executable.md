# OpenAI connector — Make your OpenAI connector executable

To work with the **OpenAI connector**, fill all mandatory fields.


## Authentication

To use the **OpenAI connector**, obtain an API key from OpenAI. To create an OpenAI account and learn more about API keys, visit the [OpenAI Platform](https://platform.openai.com/) documentation.

### Create a new connector secret

Keep your **API key** safe and avoid exposing it in the BPMN `xml` file by creating a secret:

1. Follow our [guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets).
2. Name your secret (i.e `OPENAI_API_KEY`) so you can reference it later in the connector.

### Configure the API key

Select the **OpenAI API key** field in the **Authentication** section and set it to the secret you created (e.g. `{{secrets.OPENAI_API_TOKEN}}`).

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/openai
