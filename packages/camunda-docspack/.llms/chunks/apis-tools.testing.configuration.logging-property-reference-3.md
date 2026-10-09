# Configuration — Logging — Property reference (3)

**Example (Ollama):**

```yaml
camunda:
  process-test:
    judge:
      chat-model:
        provider: "openai-compatible"
        model: "llama3"
        base-url: "http://localhost:11434/v1"
```

For providers not listed above, use a custom provider name and pass arbitrary properties. See
[Custom ChatModelAdapter](#custom-chatmodeladapter) for implementation details.

| Property                               | Required | Type       | Description                                                                                   |
| -------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------- |
| `judge.chat-model.provider`            | Yes      | `string`   | Custom provider name matching your SPI implementation.                                        |
| `judge.chat-model.model`               | Yes      | `string`   | Model name.                                                                                   |
| `judge.chat-model.custom-properties.*` | No       | `map`      | Arbitrary key-value pairs passed to SPI providers via `ProviderConfig.getCustomProperties()`. |
| `judge.chat-model.timeout`             | No       | `duration` | Request timeout (ISO-8601 duration, for example `PT30S`).                                     |
| `judge.chat-model.temperature`         | No       | `double`   | Temperature for response randomness (0.0 to 2.0).                                             |

**Example:**

```yaml
camunda:
  process-test:
    judge:
      chat-model:
        provider: "my-custom-provider"
        model: "my-model"
        custom-properties:
          endpoint: "https://my-llm.example.com/v1"
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
