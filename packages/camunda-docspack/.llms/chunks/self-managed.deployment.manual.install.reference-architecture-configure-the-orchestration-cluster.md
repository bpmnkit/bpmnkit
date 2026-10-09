# Camunda manual installation — Reference architecture — Configure the Orchestration Cluster

This guide uses a single-node orchestration cluster with a local Elasticsearch instance as the document-store secondary storage example. If this setup matches your environment, no additional configuration is required.

If you want to use RDBMS as secondary storage instead, follow [manual installation with RDBMS](https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/index).

If you plan to:

- Add more nodes to the cluster
- Use a different external secondary storage
- Enable Connectors
- Apply a license key

You need to make targeted configuration changes. The following sections outline the minimum required adjustments for each use case. Combine these changes into a single `application.yaml` under the appropriate configuration keys, or export them as environment variables.

For detailed configuration options and advanced setup guidance, refer to each component’s documentation under the [Orchestration cluster section](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/overview).

**Note**

Configuration is being unified across components. Some changes will only take effect in future versions, so you may see a mix of old and new configuration options.

#### Configure the secondary storage

Set the secondary storage type value to `elasticsearch` or `opensearch` for this configuration path. Remove fields that do not apply to your selection.

If your security settings require authentication for the secondary storage, configure both `username` and `password`.
Omit these fields if authentication is not required.

The following configuration defines how the Orchestration Cluster connects to document-store secondary storage (Elasticsearch or OpenSearch). This applies to the included Operate, Tasklist, Admin, and Camunda Exporter.

For detailed configuration options, see the [Orchestration Cluster configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/overview)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
