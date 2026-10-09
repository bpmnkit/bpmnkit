# Camunda components metrics — Troubleshoot metrics and dashboards — Physical Tenant filtering is missing from a panel

**Observed behavior:** The `physicalTenant` variable or label isn't available on a specific Grafana panel, even though it works elsewhere in the same dashboard.

**Why this happens:** See [Physical Tenant filtering](#physical-tenant-filtering) for which metrics and dashboards expose the `physicalTenant` label.

**How to fix:** Confirm the panel's underlying metric is partition-scoped. If it is and still lacks the label, check the linked issue in [Physical Tenant filtering](#physical-tenant-filtering) for status before assuming a misconfiguration.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
