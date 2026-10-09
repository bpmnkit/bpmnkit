# Configuration reference — Reliability

| Variable                               | Default    | Description                                                 |
| -------------------------------------- | ---------- | ----------------------------------------------------------- |
| `CAMUNDA_SDK_BACKPRESSURE_PROFILE`     | `BALANCED` | `BALANCED` (gates) or `LEGACY` (observe-only).              |
| `CAMUNDA_SDK_HTTP_RETRY_MAX_ATTEMPTS`  | —          | Max transient-error retry attempts.                         |
| `CAMUNDA_SDK_HTTP_RETRY_BASE_DELAY_MS` | —          | Base backoff delay for retries, in milliseconds.            |
| `CAMUNDA_SDK_HTTP_RETRY_MAX_DELAY_MS`  | —          | Max backoff delay for retries, in milliseconds.             |
| `CAMUNDA_SDK_EVENTUAL_POLL_DEFAULT_MS` | —          | Default eventual-consistency poll timeout, in milliseconds. |
| `CAMUNDA_SDK_LOG_LEVEL`                | `info`     | `off`, `error`, `warn`, `info`, `debug`, or `trace`.        |

---
Source: https://docs.camunda.io/docs/next/apis-tools/go-sdk/configuration-reference
