# Copilot — Configuration — applicationYaml

| Property                                                      | Description                                                              | Example value                                 | Default value |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------- | ------------- |
| `camunda.hub.copilot.providers.hugging-face.default-model-id` | Default model ID for Hugging Face Inference.                             | `mistralai/Mixtral-8x7B-Instruct-v0.1`        | -             |
| `camunda.hub.copilot.providers.hugging-face.base-url`         | Base URL for Hugging Face Inference endpoint (if self-hosted or custom). | `https://api-inference.huggingface.co/models` | -             |
| `camunda.hub.copilot.providers.hugging-face.access-token`     | Access token for Hugging Face.                                           | `hf_***`                                      | -             |
| `camunda.hub.copilot.providers.hugging-face.wait-for-model`   | [optional] Wait for model to warm up before responding.                  | `false`                                       | `true`        |
| `camunda.hub.copilot.providers.hugging-face.return-full-text` | [optional] Return the full generated text (not just the completion).     | `true`                                        | `true`        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
