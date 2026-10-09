# Camunda components metrics — Troubleshoot metrics and dashboards — OTLP export fails or backend rejects the data

**Observed behavior:** Metrics reach your OTLP endpoint's logs as errors, or don't appear in the target system at all.

**Why this happens:** OTLP backends vary in what they require beyond a reachable `url`. Some need authentication headers (`otlp.metrics.export.headers`), and some don't support the default `cumulative` aggregation temporality and require `delta` instead (for example, Dynatrace). See [OpenTelemetry Protocol](#opentelemetry-protocol).

**How to fix:** Check your target system's OTLP requirements for authentication headers and its required aggregation temporality, and set both explicitly rather than relying on Micrometer's defaults.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
