# Resilience

# Resilience


## HTTP Retry

Automatic retry with exponential backoff and jitter for transient failures (429, 503, 500, timeouts).

| Variable                               | Default | Description                        |
| -------------------------------------- | ------- | ---------------------------------- |
| `CAMUNDA_SDK_HTTP_RETRY_MAX_ATTEMPTS`  | `3`     | Total attempts (initial + retries) |
| `CAMUNDA_SDK_HTTP_RETRY_BASE_DELAY_MS` | `100`   | Base backoff delay (ms)            |
| `CAMUNDA_SDK_HTTP_RETRY_MAX_DELAY_MS`  | `2000`  | Maximum backoff cap (ms)           |

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/resilience
