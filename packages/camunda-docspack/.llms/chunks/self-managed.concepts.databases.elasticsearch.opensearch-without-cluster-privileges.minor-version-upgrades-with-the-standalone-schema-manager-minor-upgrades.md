# OpenSearch without cluster privileges — Minor version upgrades with the standalone schema manager {#minor-upgrades}

For a minor upgrade (N → N+1), pre-run the standalone schema manager of version N+1 with a privileged user to apply new templates/mappings. Then upgrade the application with schema creation disabled.

If the upgrade requires a data/application migration (see [Upgrade overview](https://docs.camunda.io/docs/next/versioned_docs/version-8.8/self-managed/upgrade/index)):

1. Stop or scale down the application.
2. Run schema manager (version N+1) with elevated privileges.
3. Execute migration tooling.
4. Start application at version N+1.

If no migration is required you can keep N serving traffic while running the schema manager for N+1.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/elasticsearch/opensearch-without-cluster-privileges
