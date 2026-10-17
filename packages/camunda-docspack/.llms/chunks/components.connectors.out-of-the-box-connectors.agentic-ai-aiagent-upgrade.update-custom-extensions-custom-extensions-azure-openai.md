# Upgrade AI Agent element templates — Update custom extensions {#custom-extensions} — Azure OpenAI

**Legacy template Provider**: Azure OpenAI → **New template Provider**: [OpenAI](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers#openai), **Backend**: Microsoft Foundry (Azure).

The provider itself changes from **Azure OpenAI** to **OpenAI**. Azure/Microsoft Foundry is now a backend of the general-purpose OpenAI provider rather than its own top-level provider.

**Authentication: API key**, **Timeout**, **Temperature**, and **top P** carry over unchanged.

| Legacy field                                                                             | New template field                                                                                 |
| :--------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| Endpoint                                                                                 | API endpoint                                                                                       |
| Authentication: Client credentials (Client ID, Client secret, Tenant ID, Authority host) | Authentication: Entra ID: Client credentials (Client ID, Client secret, Tenant ID, Authority host) |
| Model deployment name                                                                    | Model                                                                                              |
| Maximum tokens                                                                           | Max output tokens (Responses API) or Max completion tokens (Chat Completions API)                  |

The new template additionally offers an **Entra ID: Managed identity** authentication option (Hybrid/Self-Managed only), an optional **Entra ID scope** override, and the **Effort** reasoning parameter.

**Note**
A multi-replica connectors runtime setup means each replica acquires and caches its own Entra ID token independently. Expect parallel credential/token requests against Entra ID rather than a single shared token.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade
