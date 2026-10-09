# AI Agent model providers — Choose a provider and backend

Start from where your organization already permits LLM traffic to be routed, not from a model's native wire format. Security, data residency, procurement, networking, and audit requirements often determine which **backend** (Amazon Bedrock, Microsoft Foundry, Google Cloud, or an internal gateway) is actually available to you. Once you know which backends are approved, pick the **provider** that gives that model the most capable configuration surface:

- **Provider** selects the wire format the AI Agent uses to talk to the LLM. For example, the Anthropic Messages API, or the OpenAI Responses/Chat Completions API. This determines which provider-specific capabilities are available, such as Anthropic's extended thinking or Gemini's thinking level.
- **Backend** (where more than one is available for a provider) selects which infrastructure actually serves that API: the vendor's own hosted API, a hyperscaler platform that exposes a compatible endpoint, or a custom/self-hosted endpoint.

These two choices are independent, so the same model family may be available through multiple backends. Within your approved backend, select the provider that matches the model's native wire format (for example, Anthropic for Claude models, even when hosted on Bedrock) rather than a generic hyperscaler provider: it gives you that provider's own configuration surface, such as reasoning/extended thinking and prompt caching, regardless of where the model is actually hosted.

| If your organization requires...       | Start with...                                                       | Prefer instead when...                                                                                                                        |
| :------------------------------------- | :------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| Traffic routed through Amazon Bedrock  | [AWS Bedrock Converse](#aws-bedrock-converse)                       | Running **Claude** models: use [Anthropic](#anthropic)'s AWS Bedrock Mantle backend instead, to keep Anthropic-specific configuration.        |
| Traffic routed through Microsoft Azure | [OpenAI](#openai)'s Microsoft Foundry (Azure) backend               | Running **Claude** models: use [Anthropic](#anthropic)'s Microsoft Foundry (Azure) backend instead, to keep Anthropic-specific configuration. |
| Traffic routed through Google Cloud    | [Google Gemini](#google-gemini)'s Enterprise Agent Platform backend | No exception for Gemini models. Use the direct Gemini API only if Google Cloud isn't mandated.                                                |
| No specific cloud mandate              | The provider matching the model's native wire format                | N/A                                                                                                                                           |

The most capable option within your organization's approved boundary is the correct choice; the native wire format alone doesn't determine it.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers
