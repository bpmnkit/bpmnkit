# Camunda components metrics — Troubleshoot metrics and dashboards — Grafana dashboard shows no data after import

**Observed behavior:** The dashboard renders, but panels show "No data" or stay empty.

**Why this happens:** The dashboard's panels aren't bound to a Prometheus data source, either because none was selected during import, or because the wrong one was selected when more than one is configured in Grafana.

**How to fix:**

1. Open the dashboard's settings and check the data source assigned under its variables and panels.
2. If it's missing or wrong, re-import the dashboard and explicitly select your Prometheus data source when prompted.
3. Confirm the data source itself can reach Prometheus by testing it from **Connections > Data sources** in Grafana.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
