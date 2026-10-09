# Camunda components metrics — Secret resolution and cache metrics — Cache size and the configured maximum

`camunda.secret.cache.size` is bounded per store by the
[`camunda.secrets.cache.max-size`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundasecretscache)
property. The bound applies per store, not as a shared budget, so the worst-case memory footprint
across a deployment is the number of configured stores multiplied by that maximum.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
