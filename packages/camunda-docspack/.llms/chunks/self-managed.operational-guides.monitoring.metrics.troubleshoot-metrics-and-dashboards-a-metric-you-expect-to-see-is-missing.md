# Camunda components metrics — Troubleshoot metrics and dashboards — A metric you expect to see is missing

**Observed behavior:** A documented metric name doesn't appear in Prometheus or Grafana, even though scraping otherwise works.

**Why this happens:** One of three causes, in order of likelihood:

- The metric is processing-related and only recorded when its triggering event occurs. For example, `zeebe_incident_events_total` only appears after an incident is created or resolved, see [available metrics](#available-metrics).
- The metric was filtered out. Filtering matches by prefix, so a rule intended to filter `zeebe.foo` also filters `zeebe.foobar` and anything else starting with that prefix. See [filtering](#filtering).
- The node role doesn't expose that metric. Brokers and gateways expose different metric sets, see the note under [available metrics](#available-metrics).

**How to fix:** Trigger the underlying event and check again, then review your filter configuration for an overly broad prefix match, then confirm you're querying the node role that actually exposes that metric.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
