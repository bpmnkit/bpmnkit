# Configuration — Logging — Property reference

All judge properties are nested under `camunda.process-test.judge` in Spring configuration. In Java properties files,
use the `judge.` prefix with camelCase keys (for example, `judge.chat-model.api-key` becomes `judge.chatModel.apiKey`).

For configuration examples, see [Step 2: configure the LLM provider and connectors](https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/test-ai-agents#step-2-configure-the-llm-provider-and-connectors).

Unless noted otherwise, properties in the provider tables are required.

#### Judge settings

| Property                 | Type      | Default | Description                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `judge.threshold`        | `double`  | `0.5`   | Confidence threshold (0.0 to 1.0) for the judge to pass.                                                                                                                                                                                                                                                                                      |
| `judge.custom-prompt`    | `string`  |         | Custom evaluation prompt replacing the default criteria.                                                                                                                                                                                                                                                                                      |
| `judge.attach-documents` | `boolean` | `false` | When `true`, resolves Camunda document references in the evaluated variable and attaches their content to the judge. Disabled by default to avoid unnecessary token cost. To evaluate attached content, use a multimodal-capable model; otherwise, CPT evaluates only the raw variable JSON. See [document attachment](#document-attachment). |

The default threshold of `0.5` treats a response as acceptable when it is at least partially satisfied according to the
judge rubric. This is a practical default for AI-generated output, where wording and level of detail may vary between
runs even when the response is still useful. Increase the threshold when your assertion needs stricter semantic
agreement.

#### Chat model settings

| Property                       | Required | Type       | Description                                               |
| ------------------------------ | -------- | ---------- | --------------------------------------------------------- |
| `judge.chat-model.provider`    | Yes      | `string`   | Set to `openai`.                                          |
| `judge.chat-model.model`       | Yes      | `string`   | Model name (for example `gpt-4o`).                        |
| `judge.chat-model.api-key`     | Yes      | `string`   | API key.                                                  |
| `judge.chat-model.timeout`     | No       | `duration` | Request timeout (ISO-8601 duration, for example `PT30S`). |
| `judge.chat-model.temperature` | No       | `double`   | Temperature for response randomness (0.0 to 2.0).         |

**Example:**

```yaml
camunda:
  process-test:
    judge:
      chat-model:
        provider: "openai"
        model: "gpt-4o"
        api-key: ${OPENAI_API_KEY}
```

| Property                       | Required | Type       | Description                                               |
| ------------------------------ | -------- | ---------- | --------------------------------------------------------- |
| `judge.chat-model.provider`    | Yes      | `string`   | Set to `anthropic`.                                       |
| `judge.chat-model.model`       | Yes      | `string`   | Model name (for example `claude-sonnet-4-20250514`).      |
| `judge.chat-model.api-key`     | Yes      | `string`   | API key.                                                  |
| `judge.chat-model.timeout`     | No       | `duration` | Request timeout (ISO-8601 duration, for example `PT30S`). |
| `judge.chat-model.temperature` | No       | `double`   | Temperature for response randomness (0.0 to 2.0).         |

**Example:**

```yaml
camunda:
  process-test:
    judge:
      chat-model:
        provider: "anthropic"
        model: "claude-sonnet-4-20250514"
        api-key: ${ANTHROPIC_API_KEY}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
