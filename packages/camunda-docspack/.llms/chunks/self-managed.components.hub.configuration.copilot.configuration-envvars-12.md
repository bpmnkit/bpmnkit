# Copilot — Configuration — envVars

| Environment variable                            | Description                                                              | Example value                                 | Default value |
| ----------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------- | ------------- |
| `RESTAPI_COPILOT_HUGGING_FACE_DEFAULT_MODEL_ID` | Default model ID for Hugging Face Inference.                             | `mistralai/Mixtral-8x7B-Instruct-v0.1`        | -             |
| `RESTAPI_COPILOT_HUGGING_FACE_BASE_URL`         | Base URL for Hugging Face Inference endpoint (if self-hosted or custom). | `https://api-inference.huggingface.co/models` | -             |
| `RESTAPI_COPILOT_HUGGING_FACE_ACCESS_TOKEN`     | Access token for Hugging Face.                                           | `hf\_**\*\*\*\***`                            | -             |
| `RESTAPI_COPILOT_HUGGING_FACE_WAIT_FOR_MODEL`   | [optional] Wait for model to warm up before responding.                  | `false`                                       | `true`        |
| `RESTAPI_COPILOT_HUGGING_FACE_RETURN_FULL_TEXT` | [optional] Return the full generated text (not just the completion).     | `true`                                        | `true`        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
