# Camunda components metrics — Secret resolution and cache metrics

Camunda emits meters for secret resolution and for the in-memory cache associated with each configured store. Use these meters to distinguish a slow or unavailable secret store from a cold cache when jobs don't activate.

These meters don't use secret names as labels because secret-name cardinality is unbounded and secret names contain customer data.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
