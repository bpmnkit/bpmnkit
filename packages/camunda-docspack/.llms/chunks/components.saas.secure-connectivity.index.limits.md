# Secure connectivity (AWS PrivateLink) — Limits

The following limits apply:

- Up to 10 VPC endpoint connections per organization (adjustable on request).
- Up to 10 VPC endpoint connections per cluster.

Contact Camunda support if you require higher limits.


## Supported connectivity modes

The following combinations are supported:

| Private connectivity | Public connectivity | Supported |
| -------------------- | ------------------- | --------- |
| Disabled             | Enabled             | Yes       |
| Enabled              | Enabled             | Yes       |
| Enabled              | Disabled            | No        |

Private-only connectivity is not currently supported.
Public connectivity remains enabled even when secure connectivity is configured.

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/index
