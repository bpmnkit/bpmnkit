# Copilot — Configuration — envVars

| Environment variable                                                                  | Description                                                               | Example value        | Default value |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------- | ------------- |
| `CAMUNDA_HUB_COPILOT_DEFAULTFEELCOPILOTLLMCONFIGURATION_TEMPERATURE`                  | [optional] Sampling temperature.                                          | `0.2`                | `0.3`         |
| `CAMUNDA_HUB_COPILOT_DEFAULTFEELCOPILOTLLMCONFIGURATION_TOPP`                         | [optional] Nucleus sampling probability.                                  | `0.90`               | `0.95`        |
| `CAMUNDA_HUB_COPILOT_DEFAULTFEELCOPILOTLLMCONFIGURATION_TOPK`                         | [optional] Top-K sampling (if supported by the model).                    | `100`                | `64`          |
| `CAMUNDA_HUB_COPILOT_DEFAULTFEELCOPILOTLLMCONFIGURATION_MAXTOKENS`                    | [optional] Maximum new tokens per response.                               | `4096`               | `8192`        |
| `CAMUNDA_HUB_COPILOT_DEFAULTFEELCOPILOTLLMCONFIGURATION_TIMEOUT`                      | [optional] Overall request timeout.                                       | `45s`                | `60s`         |
| `CAMUNDA_HUB_COPILOT_DEFAULTFEELCOPILOTLLMCONFIGURATION_LOGREQUESTS`                  | [optional] Log raw requests (not recommended in production).              | `true`               | `false`       |
| `CAMUNDA_HUB_COPILOT_DEFAULTFEELCOPILOTLLMCONFIGURATION_LOGRESPONSES`                 | [optional] Log raw responses (not recommended in production).             | `true`               | `false`       |
| `CAMUNDA_HUB_COPILOT_DEFAULTFEELCOPILOTLLMCONFIGURATION_CONNECTIONACQUISITIONTIMEOUT` | [optional] Connection pool acquisition timeout.                           | `10s`                | `30s`         |
| `CAMUNDA_HUB_COPILOT_DEFAULTFEELCOPILOTLLMCONFIGURATION_LOGITBIAS`                    | [optional] JSON object mapping token IDs to bias values (model-specific). | `{"123":-2,"456":3}` | `{}`          |
| `CAMUNDA_HUB_COPILOT_DEFAULTFEELCOPILOTLLMCONFIGURATION_MAXCONNECTIONS`               | [optional] Maximum HTTP connections.                                      | `300`                | `200`         |
| `CAMUNDA_HUB_COPILOT_DEFAULTFEELCOPILOTLLMCONFIGURATION_READTIMEOUT`                  | [optional] Read timeout per request.                                      | `120s`               | `60s`         |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
