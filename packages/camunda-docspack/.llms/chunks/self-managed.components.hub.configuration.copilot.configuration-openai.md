# Copilot — Configuration — OpenAI

**Note**
This configuration applies to OpenAI and OpenAI-compatible providers.

Provide exactly one of the following:

- An API key for OpenAI's public API (no custom endpoint needed).
- A custom endpoint for OpenAI-compatible providers or proxies.

For OpenAI-compatible providers, you can authenticate with:

- A bearer token.
- Username and password (Basic authentication).
- Custom authentication headers.

When using the Bring your own model option in Self-Managed, results may vary depending on your chosen LLM's capabilities.

If a weaker or smaller model is used, it may fail to generate a valid BPMN XML. In such cases, the Copilot library attempts automatic repair up to three times. If those attempts fail, the system will return an empty XML and an optional chat message instead of a model.

**Tip**
Camunda recommends using a stronger model, such as GPT-4 or comparable, for reliable BPMN generation.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
