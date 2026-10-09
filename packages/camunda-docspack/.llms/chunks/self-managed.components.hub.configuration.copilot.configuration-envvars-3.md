# Copilot — Configuration — envVars

| Environment variable                                  | Description                                                               | Example value        | Default value |
| ----------------------------------------------------- | ------------------------------------------------------------------------- | -------------------- | ------------- |
| `RESTAPI_FEEL_COPILOT_TEMPERATURE`                    | [optional] Sampling temperature.                                          | `0.2`                | `0.3`         |
| `RESTAPI_FEEL_COPILOT_TOP_P`                          | [optional] Nucleus sampling probability.                                  | `0.90`               | `0.95`        |
| `RESTAPI_FEEL_COPILOT_TOP_K`                          | [optional] Top-K sampling (if supported by the model).                    | `100`                | `64`          |
| `RESTAPI_FEEL_COPILOT_MAX_TOKENS`                     | [optional] Maximum new tokens per response.                               | `4096`               | `8192`        |
| `RESTAPI_FEEL_COPILOT_TIMEOUT`                        | [optional] Overall request timeout.                                       | `45s`                | `60s`         |
| `RESTAPI_FEEL_COPILOT_LOG_REQUEST`                    | [optional] Log raw requests (not recommended in production).              | `true`               | `false`       |
| `RESTAPI_FEEL_COPILOT_LOG_RESPONSE`                   | [optional] Log raw responses (not recommended in production).             | `true`               | `false`       |
| `RESTAPI_FEEL_COPILOT_CONNECTION_ACQUISITION_TIMEOUT` | [optional] Connection pool acquisition timeout.                           | `10s`                | `30s`         |
| `RESTAPI_FEEL_COPILOT_LOGIT_BIAS`                     | [optional] JSON object mapping token IDs to bias values (model-specific). | `{"123":-2,"456":3}` | `{}`          |
| `RESTAPI_FEEL_COPILOT_MAX_CONNECTIONS`                | [optional] Maximum HTTP connections.                                      | `300`                | `200`         |
| `RESTAPI_FEEL_COPILOT_READ_TIMEOUT`                   | [optional] Read timeout per request.                                      | `120s`               | `60s`         |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
