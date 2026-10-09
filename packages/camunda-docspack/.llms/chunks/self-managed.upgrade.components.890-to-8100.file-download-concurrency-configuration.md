# Upgrade Camunda components from 8.9 to 8.10 — File download concurrency configuration

The file download endpoints used by Web Modeler features in Camunda Hub no longer use a bounded executor. Downloads now stream synchronously on the request thread, with concurrent downloads limited by a semaphore. As a result, the following executor tuning properties have been removed:

- `camunda.modeler.file-download.executor.core-pool-size`
- `camunda.modeler.file-download.executor.max-pool-size`
- `camunda.modeler.file-download.executor.queue-capacity`

These properties have been replaced by a single property:

- `camunda.hub.file-download.max-concurrent-downloads` — default `15`, matching the 8.9 defaults of `max-pool-size: 5` plus `queue-capacity: 10`.

**Warning**
If any of the removed properties are still set, for example as environment variables, Camunda Hub **fails to start**. Spring would otherwise ignore these unknown properties, so the fail-fast behavior prevents existing download tuning from being silently dropped.

Before upgrading, remove the executor properties. If you need to tune download concurrency, set `camunda.hub.file-download.max-concurrent-downloads` instead.

With the 8.9 defaults, at most five downloads ran concurrently with up to 10 queued. In 8.10, up to 15 downloads stream concurrently. If you customized the 8.9 executor settings, the previous limits differed from these defaults.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
