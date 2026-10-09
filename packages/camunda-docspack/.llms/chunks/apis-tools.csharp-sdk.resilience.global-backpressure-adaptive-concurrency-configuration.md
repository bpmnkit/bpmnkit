# Resilience — Global Backpressure (Adaptive Concurrency) — Configuration

| Variable                                        | Default    | Description                                             |
| ----------------------------------------------- | ---------- | ------------------------------------------------------- |
| `CAMUNDA_SDK_BACKPRESSURE_PROFILE`              | `BALANCED` | Preset profile (see below)                              |
| `CAMUNDA_SDK_BACKPRESSURE_INITIAL_MAX`          | `16`       | Bootstrap concurrency cap                               |
| `CAMUNDA_SDK_BACKPRESSURE_SOFT_FACTOR`          | `70`       | Percentage multiplier on soft backpressure (70 → 0.70×) |
| `CAMUNDA_SDK_BACKPRESSURE_SEVERE_FACTOR`        | `50`       | Percentage multiplier on severe backpressure            |
| `CAMUNDA_SDK_BACKPRESSURE_RECOVERY_INTERVAL_MS` | `1000`     | Interval between passive recovery checks (ms)           |
| `CAMUNDA_SDK_BACKPRESSURE_RECOVERY_STEP`        | `1`        | Permits regained per recovery interval                  |
| `CAMUNDA_SDK_BACKPRESSURE_DECAY_QUIET_MS`       | `2000`     | Quiet period to downgrade severity (ms)                 |
| `CAMUNDA_SDK_BACKPRESSURE_FLOOR`                | `1`        | Minimum concurrency floor while degraded                |
| `CAMUNDA_SDK_BACKPRESSURE_SEVERE_THRESHOLD`     | `3`        | Consecutive signals required to enter severe state      |

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/resilience
