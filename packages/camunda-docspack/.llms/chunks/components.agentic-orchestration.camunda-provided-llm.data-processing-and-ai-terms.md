# Camunda-provided LLM — Data processing and AI terms

Review how Camunda-provided LLM processes your data, how OpenRouter is involved, and which terms apply when you use this feature.

### How Camunda-provided LLM works

The Camunda-provided LLM is an optional feature. When enabled, you configure which process variables, prompts, and tool outputs the agent may use. Only the data you choose to make available to the agent is sent for processing. You control this through your process configuration, such as input mappings.

### How OpenRouter is used

OpenRouter, Inc. is a routing service that gives Camunda access to a range of third-party AI models through a single integration. OpenRouter does not host or train models itself. Instead, it forwards each request to the selected AI model provider for processing. Camunda restricts this feature to providers that enforce zero data retention (ZDR). This means that neither OpenRouter nor the underlying model provider retains your data after processing the request, and your data is not used to train their models.

### OpenRouter as a sub-processor

OpenRouter, Inc. is a sub-processor engaged by Camunda in connection with this feature. When you enable this feature, your prompts, agent memory, and tool call inputs and outputs, which may contain personal data, are transmitted to OpenRouter and the selected model provider for the purpose of generating a response. This feature is optional and can be disabled at any time by turning off the **Camunda Provided LLM** toggle in [Camunda Hub](https://docs.camunda.io/docs/next/components/saas/organization/enable-alpha-features#enable-camunda-provided-llm). When disabled, no data is sent to OpenRouter. A comprehensive list of Camunda's sub-processors is available in [Camunda's Trust Center](https://trust.camunda.com/).

### AI terms

This feature is an AI Feature under Camunda's Terms for AI Usage, which apply to your use of it unless your existing agreement with Camunda provides for AI terms, in which case the latter would prevail. In addition, please refer to our [AI Usage Guidelines](https://docs.camunda.io/docs/next/guides/build-with-ai/ai-usage-guidelines) to learn more about how to use Camunda’s AI features responsibly.

### Data sharing

You control what data is made available to this feature through your process configuration. Do not include sensitive data, or other content you are not authorized to share with a third-party AI service provider.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/camunda-provided-llm
