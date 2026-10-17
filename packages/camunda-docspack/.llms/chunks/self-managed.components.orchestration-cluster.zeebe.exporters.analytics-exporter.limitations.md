# Analytics Exporter — Limitations

- **Analytics-grade only.** No exactly-once delivery, no reconciliation, no gap filling.
- **Fixed signal set.** Individual signals cannot be toggled; only whole categories.
- **No feedback on failure.** A misconfigured endpoint produces no operator-visible error.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
