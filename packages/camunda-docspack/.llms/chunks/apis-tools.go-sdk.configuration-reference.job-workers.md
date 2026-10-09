# Configuration reference — Job workers

| Variable                                                                | Default          | Description                                             |
| ----------------------------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| `CAMUNDA_WORKER_NAME`                                                   | hostname-derived | Default worker name.                                    |
| `CAMUNDA_WORKER_TIMEOUT`                                                | —                | Default job activation timeout, in milliseconds.        |
| `CAMUNDA_WORKER_MAX_CONCURRENT_JOBS` / `CAMUNDA_WORKER_MAX_JOBS_ACTIVE` | —                | Default max concurrently-activated jobs per worker.     |
| `CAMUNDA_WORKER_REQUEST_TIMEOUT`                                        | —                | Default activate-jobs request timeout, in milliseconds. |
| `CAMUNDA_WORKER_STARTUP_JITTER_MAX_SECONDS`                             | —                | Max random startup delay for workers, in seconds.       |

---
Source: https://docs.camunda.io/docs/next/apis-tools/go-sdk/configuration-reference
