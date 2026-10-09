# Camunda components metrics — Secret resolution and cache metrics — Read cache and resolution metrics together

`camunda.secret.cache.result` and `camunda.secret.resolution.outcome` describe different parts of secret resolution.

A low cache hit rate does not necessarily indicate a cache problem. References that result in permanent failures, such as not found, access denied, or invalid, are never cached and therefore produce a `MISS` on every lookup.

When the cache hit rate is low, check `camunda.secret.resolution.outcome` first. If the misses correspond to references that never resolve successfully, address the resolution failures rather than the cache configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics
