# Upgrade AI Agent element templates

Upgrade AI Agent connectors from the legacy element templates to the new element templates and migrate their model provider configurations.

Upgrade AI Agent connectors from the legacy element templates to the new element templates, and migrate their model provider configurations.


## Why upgrade

Starting with Camunda 8.10, new element templates are available for the [AI Agent Task](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task) and [AI Agent Sub-process](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess) connectors. These templates broaden the ways you can connect AI agents to LLMs. You can select from more model providers and backends to use an LLM route that meets your organization's requirements. The new templates also expose provider-specific capabilities that can support cheaper, faster, and more transparent agent behavior:

- Reasoning and extended thinking configuration (Anthropic's **Effort**/**Thinking mode**, OpenAI's **Effort**, and Google Gemini's **Thinking budget**/**Thinking level**).
- Prompt caching configuration (Anthropic, AWS Bedrock Converse).
- New backend options: [AWS Bedrock Mantle](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers#anthropic) for Anthropic Claude models and [Google Gemini API](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers#google-gemini) for direct Gemini access. Microsoft Foundry was already available as **Azure OpenAI** in the legacy templates. It is now a backend of both the OpenAI and Anthropic providers, rather than its own top-level provider. Your AI agents can therefore also use Claude models served by Foundry.
- A [custom chat model provider](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers#custom-implementation) option, for Self-Managed/hybrid deployments.

The legacy element templates keep working, and existing implementations don't need to migrate immediately. However, they don't expose the new provider and backend choices or provider-specific configuration described above. Apply a new element template to use these capabilities.

**Important**
Camunda deprecates the legacy element templates in 8.10. They will not receive new provider capabilities. They keep working. New AI Agent implementations should use the new element templates directly.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade
