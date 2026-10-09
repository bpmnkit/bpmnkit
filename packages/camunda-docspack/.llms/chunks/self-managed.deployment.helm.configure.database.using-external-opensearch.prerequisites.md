# Use Amazon OpenSearch Service for Orchestration Cluster with Helm — Prerequisites

Amazon OpenSearch requires two layers of permissions:

- AWS IAM permissions
- OpenSearch internal authentication

To connect to OpenSearch using AWS IAM roles for service accounts (IRSA), see the [IAM roles for service accounts documentation](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup#opensearch-module-setup).

To connect to OpenSearch using Basic authentication, follow the configuration below.


## Configuration

### Parameters

#### Orchestration Cluster secondary storage

| Parameter                                                                      | Type   | Default | Description                                                                                     |
| ------------------------------------------------------------------------------ | ------ | ------- | ----------------------------------------------------------------------------------------------- |
| `orchestration.data.secondaryStorage.type`                                     | string | `""`    | Type of secondary storage. Set to `opensearch` to use OpenSearch.                               |
| `orchestration.data.secondaryStorage.opensearch.url`                           | string | `""`    | URL for the OpenSearch cluster as `scheme://host:port` (for example, `https://opensearch:443`). |
| `orchestration.data.secondaryStorage.opensearch.auth.username`                 | string | `""`    | Username for OpenSearch authentication.                                                         |
| `orchestration.data.secondaryStorage.opensearch.auth.secret.inlineSecret`      | string | `""`    | OpenSearch password as a plain-text value (non-production only).                                |
| `orchestration.data.secondaryStorage.opensearch.auth.secret.existingSecret`    | string | `""`    | Reference to an existing Kubernetes Secret containing the password.                             |
| `orchestration.data.secondaryStorage.opensearch.auth.secret.existingSecretKey` | string | `""`    | Key within the existing Kubernetes Secret containing the password.                              |
| `orchestration.data.secondaryStorage.opensearch.tls.secret.existingSecret`     | string | `""`    | Reference to an existing Kubernetes Secret containing the TLS trust store.                      |
| `orchestration.data.secondaryStorage.opensearch.tls.secret.existingSecretKey`  | string | `""`    | Key within the existing Kubernetes Secret for the TLS trust store.                              |
| `orchestration.index.prefix`                                                   | string | `""`    | Index prefix in OpenSearch for the new Camunda exporter and the Orchestration Cluster.          |

### Example usage

```yaml
orchestration:
  data:
    secondaryStorage:
      type: opensearch
      opensearch:
        url: https://opensearch.example.com:443
        auth:
          username: user
          secret:
            # For non-production environments only:
            inlineSecret: "your-password-here"
            # For production (recommended):
            # existingSecret: "opensearch-secret"
            # existingSecretKey: "password"
```

This configuration connects the Orchestration Cluster to an external Amazon OpenSearch Service instance as its secondary storage backend.

To avoid storing the username and password in plaintext in your `values.yaml`, reference a Kubernetes secret.
For details and examples, see [Helm charts secret management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management).

### Connect to external OpenSearch with custom index prefixes

When running multiple Camunda instances on a shared OpenSearch cluster, use custom index prefixes to isolate data:

```yaml
orchestration:
  data:
    secondaryStorage:
      type: opensearch
      opensearch:
        url: https://opensearch.example.com:443
        auth:
          username: admin
          secret:
            inlineSecret: pass
  index:
    prefix: my-env-camunda # Prefix for Orchestration Cluster indices
```

For more details about index prefix configuration and Optimize-specific settings, see [Configure Elasticsearch and OpenSearch index prefixes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices).

### Component configuration

Orchestration Cluster components use the same configuration keys for both Elasticsearch and OpenSearch.
To switch, replace the `elasticsearch` prefix with `opensearch` and provide the corresponding values.

For example:

- **Operate**: `CAMUNDA_OPERATE_ELASTICSEARCH_URL` → `CAMUNDA_OPERATE_OPENSEARCH_URL`
- **Tasklist**: `CAMUNDA_TASKLIST_ELASTICSEARCH_URL` → `CAMUNDA_TASKLIST_OPENSEARCH_URL`

For **Zeebe**, configure the [OpenSearch exporter](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/opensearch-exporter).

For full parameter details, see:

- [Operate configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/operate/operate-configuration#settings-for-opensearch)
- [Tasklist configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/tasklist/tasklist-configuration#elasticsearch-or-opensearch)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-external-opensearch
