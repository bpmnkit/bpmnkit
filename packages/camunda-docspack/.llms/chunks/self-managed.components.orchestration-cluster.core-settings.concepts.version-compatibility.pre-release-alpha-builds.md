# Version compatibility checks — Pre-release (alpha) builds

Alpha builds (`-alpha*`) are for evaluation and are **not** valid sources or targets for a supported production upgrade path.  
Always upgrade between stable releases.


## Recommended operational steps

1. Follow the [required upgrade procedure](#required-upgrade-procedure) for every minor upgrade.
1. Do not include pre-release builds in production upgrade chains.
1. Investigate any broker health status showing `brokerStatus: DOWN` after an upgrade. This typically indicates a rejected upgrade path.


## See also

- [Schema and data migration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/schema-and-migration)

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/version-compatibility
