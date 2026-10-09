# AI Agent model providers — Supported providers — Custom implementation

**Important**
Available in Self-Managed or [hybrid](https://docs.camunda.io/docs/next/reference/glossary#hybrid-mode) deployments only.

Select this provider to use a custom chat model provider implementation that you've registered with the connector runtime, instead of one of the built-in providers above.

| Field                   | Required | Description                                                                                                        |
| :---------------------- | :------- | :----------------------------------------------------------------------------------------------------------------- |
| **Provider type**       | Yes      | Identifier for the custom chat model provider. Must match the identifier configured for the custom implementation. |
| **Provider parameters** | No       | Parameters for the custom chat model provider implementation, as a FEEL context.                                   |
| **Model**               | Yes      | Identifier of the model to use, interpreted by the custom implementation.                                          |

Implementing a custom provider requires building and registering a chat model provider with your Self-Managed or hybrid connector runtime, similar to how [custom conversation storage backends](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-customization#custom-conversation-storage) are registered.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers
