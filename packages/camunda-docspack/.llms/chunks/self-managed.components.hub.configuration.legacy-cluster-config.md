# Legacy cluster configurations

Configure clusters using legacy settings. This method of configuring clusters is deprecated and will be removed in a later version of Camunda Hub Self-Managed.

**Note: DEPRECATED**
This method of configuring clusters is deprecated and will be removed in a later version of Camunda Hub Self-Managed.

See the [migration guide](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#camunda-hub) for more details.

Clusters must be configured using the following options to access the cluster from within Camunda Hub. If no clusters are configured, you will not be able to perform any actions that require a cluster (for example, deploy, start an instance, or Play a process).

The Camunda 8 [Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install) and [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose) distributions provide a local Zeebe cluster configured by default.

To add additional clusters, increment the `0` value for each entry (for example `clusters[1]` or `CAMUNDA_HUB_CLUSTERS_1_NAME`).

**Info: Cluster version**
The available configuration options depend on the version of the cluster:

- [Common configuration (all cluster versions)](#common-configuration-all-cluster-versions)
- [Additional configuration for cluster versions >= 8.8](#additional-configuration-for-cluster-versions--88)

#### Common configuration (all cluster versions)

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/legacy-cluster-config
