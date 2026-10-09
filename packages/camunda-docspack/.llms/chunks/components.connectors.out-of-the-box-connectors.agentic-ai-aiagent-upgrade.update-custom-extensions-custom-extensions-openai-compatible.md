# Upgrade AI Agent element templates — Update custom extensions {#custom-extensions} — OpenAI-compatible

**Legacy template Provider**: OpenAI-compatible → **New template Provider**: [OpenAI](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers#openai), **Backend**: Custom / compatible endpoint.

**API endpoint**, **Headers**, **Query parameters**, **Timeout**, **Model**, **Temperature**, and **top P** carry over unchanged. The legacy **API key** field now sits behind the **Authentication** selector, as described in the notes below.

| Legacy field              | New template field                                                        |
| :------------------------ | :------------------------------------------------------------------------ |
| Maximum completion tokens | Max completion tokens (Chat Completions) or Max output tokens (Responses) |
| Custom parameters         | Body properties                                                           |

**Important**
The new template replaces the legacy **API key** field with an **Authentication** selector. Resolve your effective credential as follows before you configure it:

- If your legacy template's **Headers** contained an `Authorization` header, it took precedence over the **API key** field. Carry this behavior forward manually:
  - If the header used `Bearer <token>`, select **API key** and move the token value without the `Bearer` prefix into the **API key** field. Remove the `Authorization` header from **Headers**.
  - For any other scheme, such as `Basic ...`, keep the header in **Headers** and select **None**.
- Otherwise, select **API key** and carry your legacy **API key** value over directly. If you did not configure an `Authorization` header or an API key, select **None**.

The new template additionally supports **OAuth 2.0** client credentials, for a gateway that issues bearer tokens through the client-credentials flow.

Also check the resulting request path. The new template appends `/chat/completions` or `/responses` to **API endpoint** for the selected **API**. This may differ from your legacy endpoint.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade
