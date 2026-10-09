# AI Agent model providers — Supported providers — custom

Any endpoint implementing the Anthropic Messages API, such as a proxy or gateway in front of Anthropic.

| Field              | Required | Description                                                                     |
| :----------------- | :------- | :------------------------------------------------------------------------------ |
| **API endpoint**   | Yes      | Base URL of the Anthropic-compatible API. The connector appends `/v1/messages`. |
| **Authentication** | Yes      | **None** (default), **API key**, or **OAuth 2.0** client credentials.           |

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

#### Anthropic model and parameters

| Field                      | Required | Description                                                                                                                                                                                                                        |
| :------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Model**                  | Yes      | The model ID to use. See the [Claude models overview](https://docs.anthropic.com/en/docs/about-claude/models/all-models). On the Microsoft Foundry backend, enter the deployment name instead.                                     |
| **Effort**                 | No       | Controls how many tokens the model spends when responding, trading thoroughness against speed and cost. Not supported on all models. See the [effort documentation](https://platform.claude.com/docs/en/build-with-claude/effort). |
| **Thinking mode**          | No       | Extended thinking mechanism: `enabled` uses a manual token budget (older models), `adaptive` lets the model manage it (newer models), `disabled` turns it off. Support varies by model.                                            |
| **Thinking budget tokens** | Depends  | Maximum number of tokens the model may spend on extended thinking (minimum 1024). Shown only when **Thinking mode** is `enabled`.                                                                                                  |
| **Thinking display**       | No       | Controls how extended thinking is returned when **Thinking mode** is `adaptive`: `summarized` includes a plain-text summary in the response, `omitted` leaves it out.                                                              |
| **Enable prompt caching**  | No       | Enables Anthropic's automatic prompt caching. See the [prompt caching documentation](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#automatic-caching).                                                      |
| **Maximum tokens**         | No       | The maximum number of tokens per request to generate before stopping.                                                                                                                                                              |
| **Temperature**            | No       | Primary response-variation control from 0 to 1. Lower values favor likely tokens more strongly; higher values increase variation.                                                                                                  |
| **top P**                  | No       | Advanced nucleus-sampling control from 0 to 1. Limits selection to likely tokens whose cumulative probability reaches this value.                                                                                                  |
| **top K**                  | No       | Advanced sampling control configured as a positive integer. Limits selection to this number of the most likely tokens.                                                                                                             |
| **Timeout**                | No       | Maximum time to wait for a model API call. See [model call timeout](#model-call-timeout).                                                                                                                                          |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-model-providers
