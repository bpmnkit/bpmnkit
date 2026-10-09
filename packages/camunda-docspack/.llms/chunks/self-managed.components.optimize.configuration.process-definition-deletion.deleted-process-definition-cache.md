# Process definition data deletion — Deleted process definition cache

As long as a process definition deletion job record exists in the job registry, Optimize suppresses reimporting data for that process definition.
To minimize the impact of the suppression check on the import path and on Elasticsearch/OpenSearch, the suppression is backed by a cache of the most recently deleted process definition IDs, sized by `caches.deletedProcessDefinitions.maxSize`.

If more process definitions have pending or completed deletions than fit in this cache, the oldest ones fall out of suppression and their data can be reimported.

See the [deleted process definition cache settings](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#deleted-process-definition-cache) for the available configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/process-definition-deletion
