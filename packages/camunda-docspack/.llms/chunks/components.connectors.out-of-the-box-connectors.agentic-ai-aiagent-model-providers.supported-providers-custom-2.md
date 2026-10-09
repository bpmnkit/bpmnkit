# AI Agent model providers — Supported providers — custom

Connect to any LLM that exposes an OpenAI-compatible API, including open-weight models such as Qwen, Llama, and Mistral, hosted through Ollama or any compatible inference platform.

| Field              | Required | Description                                                                                                                          |
| :----------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| **API endpoint**   | Yes      | Base URL of the OpenAI-compatible API. The connector appends `/chat/completions` or `/responses`, depending on the selected **API**. |
| **Authentication** | Yes      | **None** (default), **API key**, or **OAuth 2.0** client credentials.                                                                |

Authentication fields per method:

- **None**: sends no credentials, for an endpoint that doesn't require them.
- **API key**: sends the configured API key with each request.
- **OAuth 2.0**: requests a bearer token through the [OAuth 2.0 client credentials flow](https://www.rfc-editor.org/rfc/rfc6749#section-4.4) and sends it with each request.
  - **OAuth 2.0 token endpoint**: the token endpoint of the authorization server.
  - **Client ID**: the client ID of the OAuth client.
  - **Client secret**: the client secret of the OAuth client.
  - **Audience**: (optional) the unique identifier of the target API. Required by some authorization servers only.
  - **Client authentication**: whether to send the client credentials as a Basic authentication header (default) or in the request body.
  - **Scopes**: (optional) a space-separated list of scopes to request, for example `read:models read:deployments`.

#### OpenAI model and parameters

| Field                                                                            | Required | Description                                                                                                                                                                                                                                                                                                                                                                       |
| :------------------------------------------------------------------------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Model**                                                                        | Yes      | The model ID to use. See the [OpenAI models documentation](https://platform.openai.com/docs/models). On the Microsoft Foundry backend, enter the deployment name instead.                                                                                                                                                                                                         |
| **Effort**                                                                       | No       | Controls how many tokens the model spends when responding, trading thoroughness against speed and cost. Not supported on all models. See the [Responses](https://developers.openai.com/api/reference/resources/responses/methods/create) or [Chat Completions](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create) API reference. |
| **Max output tokens** (Responses) / **Max completion tokens** (Chat Completions) | No       | The maximum number of tokens per request to generate before stopping. The field name depends on the selected **API**.                                                                                                                                                                                                                                                             |
| **Temperature**                                                                  | No       | Primary response-variation control from 0 to 2. Lower values favor likely tokens more strongly; higher values increase variation.                                                                                                                                                                                                                                                 |
| **top P**                                                                        | No       | Advanced nucleus-sampling control from 0 to 1. Limits selection to likely tokens whose cumulative probability reaches this value.                                                                                                                                                                                                                                                 |
| **Timeout**                                                                      | No       | Maximum time to wait for a model API call. See [model call timeout](#model-call-timeout).                                                                                                                                                                                                                                                                                         |

OpenAI doesn't support a **top K** parameter.

Prompt caching is automatic when the request meets OpenAI's caching requirements and isn't user-configurable.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers
