# Overview — Deleted process definition cache

Settings for the cache that suppresses reimporting data for a process definitions with deletion job record. See [Process definition data deletion](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/process-definition-deletion) for details.

| YAML path                                         | Environment variable                                                 | Default value | Description                                                                                                  |
| ------------------------------------------------- | -------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| caches.deletedProcessDefinitions.maxSize          | CAMUNDA_OPTIMIZE_DELETED_PROCESS_DEFINITION_CACHE_MAX_SIZE           | 10000         | The maximum number of deleted process definition IDs kept in the import-suppression cache.                   |
| caches.deletedProcessDefinitions.defaultTtlMillis | CAMUNDA_OPTIMIZE_DELETED_PROCESS_DEFINITION_CACHE_DEFAULT_TTL_MILLIS | 300000        | The time, in milliseconds, the import-suppression cache is kept before it's refreshed from the job registry. |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration
