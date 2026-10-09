# AI Agent model providers — Model call timeout

Every built-in provider has an optional **Timeout** field. It sets the maximum time to wait for a model API call, in [ISO-8601 duration format](https://en.wikipedia.org/wiki/ISO_8601#Durations). For example, `PT3M`.

- The default is three minutes.
- The timeout must not exceed the job worker timeout. Otherwise, the job may be reassigned while a model call is still in progress.
- In Self-Managed Spring connector runtime instances, you can override the default with the `camunda.connector.agenticai.aiagent.chat-model.api.default-timeout` property.


## Customize AI backend requests

Most backends provide advanced, low-level fields for customizing outgoing HTTP requests:

- **HTTP headers**
- **Query parameters**
- **Body properties**

Use these fields to add or override values in the request.

Whether these fields are available depends on the selected provider or backend:

- For backends with a well-known REST-style API, such as the native Anthropic API, OpenAI API, Google Gemini, and Enterprise Agent Platform backends, these fields are reserved for internal or future use, and for use in custom element templates. They are not exposed in the properties panel.
- For backends without a fixed request structure, such as AWS Bedrock Converse and custom or compatible endpoints, these fields are available as editable [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel) map expressions. You can use them to adapt the request to your deployment.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers
