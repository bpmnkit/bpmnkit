# Copilot — Configuration — applicationYaml

| Property                                                                                    | Description                                                               | Example value        | Default value |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------- | ------------- |
| `camunda.hub.copilot.default-feel-copilot-llm-configuration.temperature`                    | [optional] Sampling temperature.                                          | `0.2`                | `0.3`         |
| `camunda.hub.copilot.default-feel-copilot-llm-configuration.top-p`                          | [optional] Nucleus sampling probability.                                  | `0.90`               | `0.95`        |
| `camunda.hub.copilot.default-feel-copilot-llm-configuration.top-k`                          | [optional] Top-K sampling (if supported by the model).                    | `100`                | `64`          |
| `camunda.hub.copilot.default-feel-copilot-llm-configuration.max-tokens`                     | [optional] Maximum new tokens per response.                               | `4096`               | `8192`        |
| `camunda.hub.copilot.default-feel-copilot-llm-configuration.timeout`                        | [optional] Overall request timeout.                                       | `45s`                | `60s`         |
| `camunda.hub.copilot.default-feel-copilot-llm-configuration.log-requests`                   | [optional] Log raw requests (not recommended in production).              | `true`               | `false`       |
| `camunda.hub.copilot.default-feel-copilot-llm-configuration.log-responses`                  | [optional] Log raw responses (not recommended in production).             | `true`               | `false`       |
| `camunda.hub.copilot.default-feel-copilot-llm-configuration.connection-acquisition-timeout` | [optional] Connection pool acquisition timeout.                           | `10s`                | `30s`         |
| `camunda.hub.copilot.default-feel-copilot-llm-configuration.logit-bias`                     | [optional] JSON object mapping token IDs to bias values (model-specific). | `{"123":-2,"456":3}` | `{}`          |
| `camunda.hub.copilot.default-feel-copilot-llm-configuration.max-connections`                | [optional] Maximum HTTP connections.                                      | `300`                | `200`         |
| `camunda.hub.copilot.default-feel-copilot-llm-configuration.read-timeout`                   | [optional] Read timeout per request.                                      | `120s`               | `60s`         |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
