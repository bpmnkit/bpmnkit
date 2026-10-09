# Camunda components troubleshooting — Anomaly detection scripts — Interpretation of the results

Each script produces an output indicating the status of individual checks, which can be either `[OK]`, which signals a healthy status, or `[FAIL]`, which signals an unhealthy status.

While the scripts continue execution even if a check fails, it may be necessary to review the logs to identify the failed element.

At the end of each script, a global check status is provided, indicating whether any tests failed and the corresponding error code. For example:

```
[FAIL] ./checks/zeebe/connectivity.sh: At least one of the tests failed (error code: 5).
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
