# Upgrade AI Agent element templates — Model provider configuration mapping — OpenAI

**Legacy template Provider**: OpenAI → **New template Provider**: [OpenAI](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers#openai), **Backend**: OpenAI API.

**OpenAI API key**, **Organization ID**, **Project ID**, **Timeout**, **Model**, **Temperature**, and **top P** carry over unchanged.

| Legacy field              | New template field                                                                                                    |
| :------------------------ | :-------------------------------------------------------------------------------------------------------------------- |
| Maximum completion tokens | Max completion tokens (if you keep **API**: Chat Completions) or Max output tokens (if you switch **API**: Responses) |

The legacy template always used the Chat Completions API. The new template defaults its **API** field to the newer **Responses** API. Select **Chat Completions** instead if you need closer parity with legacy behavior. The new template additionally exposes the **Effort** reasoning parameter on both API families.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade
