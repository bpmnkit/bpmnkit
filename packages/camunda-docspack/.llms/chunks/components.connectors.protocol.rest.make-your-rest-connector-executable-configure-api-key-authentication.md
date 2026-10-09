# REST connector — Make your REST connector executable — Configure API key authentication

Select the **REST connector** and fill out the following properties under the **Authentication** section:

1. In the **Authentication** section, select **API key**.
2. Choose the location where the API key should be included:
   - **Query parameters**: The API key will be added to the URL as a query string.
   - **Headers**: The API key will be included in the request headers.
3. Specify your API key details:
   - **API key name**: Enter the parameter name expected by the API (e.g., apiKey).
   - **API key value**: Reference the secret you created for your API key (e.g., `{{secrets.REST_API_KEY_SECRET}}`).

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
