# Deploy multiple Optimize instances with Helm — Plan resource capacity

The second release is a complete additional Optimize runtime. Account for the following capacity:

- Set `optimize.resources` and `optimize.migration.resources` independently for each release.
- Reserve compute and memory for two importers, query workloads, and migration init containers.
- Size Elasticsearch or OpenSearch for both Optimize-owned index families and concurrent reads from the shared `zeebe-record` indices.
- Expect the shared datastore and OIDC provider to remain common failure and performance boundaries.
- Test backup, retention, and upgrades for each Optimize index prefix. Helm uninstall doesn't remove datastore indices.

Review the [shared Elasticsearch/OpenSearch guidance](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/shared-elasticsearch-cluster) before using this topology in production.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/deploy-multiple-optimize-instances
