# Copilot — Configuration — envVars

| Environment variable                                       | Description                                                              | Example value                                 | Default value |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------- | ------------- |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_HUGGINGFACE_DEFAULTMODELID` | Default model ID for Hugging Face Inference.                             | `mistralai/Mixtral-8x7B-Instruct-v0.1`        | -             |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_HUGGINGFACE_BASEURL`        | Base URL for Hugging Face Inference endpoint (if self-hosted or custom). | `https://api-inference.huggingface.co/models` | -             |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_HUGGINGFACE_ACCESSTOKEN`    | Access token for Hugging Face.                                           | `hf_***`                                      | -             |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_HUGGINGFACE_WAITFORMODEL`   | [optional] Wait for model to warm up before responding.                  | `false`                                       | `true`        |
| `CAMUNDA_HUB_COPILOT_PROVIDERS_HUGGINGFACE_RETURNFULLTEXT` | [optional] Return the full generated text (not just the completion).     | `true`                                        | `true`        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
