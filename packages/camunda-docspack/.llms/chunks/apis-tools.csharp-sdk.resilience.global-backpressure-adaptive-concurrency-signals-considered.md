# Resilience — Global Backpressure (Adaptive Concurrency) — Signals Considered

An HTTP response is treated as a backpressure signal when it matches one of:

- `429` (Too Many Requests) — always
- `503` with `title === "RESOURCE_EXHAUSTED"`
- `500` whose RFC 9457 / 7807 `detail` text contains `RESOURCE_EXHAUSTED`

All other 5xx variants are treated as non-retryable (fail fast) and do **not** influence the adaptive gate.

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/resilience
