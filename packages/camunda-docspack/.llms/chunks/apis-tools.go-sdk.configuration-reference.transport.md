# Configuration reference — Transport

| Variable             | Default | Description                                                                        |
| -------------------- | ------- | ---------------------------------------------------------------------------------- |
| `CAMUNDA_FALCON`     | `true`  | Enable the FALCON command-stream transport upgrade when the gateway advertises it. |
| `CAMUNDA_FORCE_REST` | —       | Force the pure-REST path even when the gateway advertises FALCON.                  |

Invalid values are rejected at construction with a configuration error rather
than being silently coerced, so a typo in a deployment manifest fails the process
at startup instead of at first request.

---
Source: https://docs.camunda.io/docs/next/apis-tools/go-sdk/configuration-reference
