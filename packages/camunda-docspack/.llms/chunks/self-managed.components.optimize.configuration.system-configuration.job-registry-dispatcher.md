# Overview — Job registry dispatcher

Settings for the background dispatcher that processes queued asynchronous jobs. See [Process definition data deletion](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/process-definition-deletion) for details.

| YAML path                              | Environment variable                                      | Default value | Description                                                                                                |
| -------------------------------------- | --------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------- |
| jobRegistry.dispatcher.enabled         | CAMUNDA_OPTIMIZE_JOB_REGISTRY_DISPATCHER_ENABLED          | false         | Toggles whether this Optimize instance dispatches queued job registry entries to be processed by handlers. |
| jobRegistry.dispatcher.intervalSeconds | CAMUNDA_OPTIMIZE_JOB_REGISTRY_DISPATCHER_INTERVAL_SECONDS | 30            | The delay, in seconds, between the end of one poll for queued jobs and the start of the next.              |
| jobRegistry.dispatcher.batchSize       | CAMUNDA_OPTIMIZE_JOB_REGISTRY_DISPATCHER_BATCH_SIZE       | 4             | The maximum number of queued job registry entries dispatched per poll cycle.                               |
| jobRegistry.dispatcher.threadCount     | CAMUNDA_OPTIMIZE_JOB_REGISTRY_DISPATCHER_THREAD_COUNT     | 2             | The number of threads used to dispatch queued jobs concurrently.                                           |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration
