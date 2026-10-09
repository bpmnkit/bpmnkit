# Camunda data purge

Purge data from your Camunda cluster

The data purge feature allows you to delete all runtime and historical data from your cluster. This operation resets the cluster to an empty state while maintaining the original topology.

The purge operation performs two main actions:

1. **Runtime Data Deletion**: Removes all live data from brokers, for example process definitions, instances, and jobs.
2. **Historical Data Purge**: Clears exported data from configured exporters

The data purge feature can be used to:

- Delete data between test runs and therefore enabling reuse of the same cluster for multiple tests.
- Resetting development or staging environments to a clean state.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/data-purge
