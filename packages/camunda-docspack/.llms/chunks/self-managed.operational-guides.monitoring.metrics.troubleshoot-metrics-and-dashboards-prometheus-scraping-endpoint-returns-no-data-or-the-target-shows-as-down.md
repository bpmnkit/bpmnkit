# Camunda components metrics — Troubleshoot metrics and dashboards — Prometheus scraping endpoint returns no data, or the target shows as down

**Observed behavior:** `/actuator/prometheus` returns an empty response or `404`, or Prometheus shows the Camunda target as down in its **Targets** page.

**Why this happens:** The Prometheus endpoint is available when the default Prometheus export settings are in place. If those defaults were changed, `management.endpoint.prometheus.access` or `management.prometheus.metrics.export.enabled` can prevent the endpoint from exporting metrics. A mismatch between the scraping job's `scheme` and the management context's actual protocol (HTTP vs. HTTPS) also causes the target to show as down.

**How to fix:**

1. Confirm both properties above are set. See [Prometheus](#prometheus).
2. Confirm the scraping job's `scheme` matches the management context's actual protocol, and its `targets` port matches the management port (default `9600`).
3. Query the endpoint directly (`curl http://<host>:9600/actuator/prometheus`) to confirm it responds before checking Prometheus.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
