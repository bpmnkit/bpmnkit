# Property reference — Data - secondary storage — secondary-storage-helm

| Helm value key                                                                                                                                       | Description                                                                                                                                                                                                                                                                        | Default value |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `orchestration.data.secondaryStorage.type`                                                                                                           | Secondary storage backend to use: `elasticsearch`, `opensearch`, or `rdbms`. Must be set explicitly.                                                                                                                                                                               | `-`           |
| `orchestration.data.secondaryStorage.elasticsearch.url``orchestration.data.secondaryStorage.opensearch.url`                                 | Full URL of the secondary storage cluster (for example, `https://my-cluster:9200`).                                                                                                                                                                                                | `-`           |
| `orchestration.data.secondaryStorage.elasticsearch.auth.username``orchestration.data.secondaryStorage.opensearch.auth.username`             | Username for accessing the secondary storage cluster (leave blank if not secured).                                                                                                                                                                                                 | `-`           |
| `orchestration.data.secondaryStorage.elasticsearch.auth.secret.*``orchestration.data.secondaryStorage.opensearch.auth.secret.*`             | Password for accessing the secondary storage cluster, provided as a Kubernetes Secret reference (`existingSecret`/`existingSecretKey`) or inline for non-production use (`inlineSecret`).                                                                                          | `-`           |
| `orchestration.index.prefix`                                                                                                                         | Optional prefix for indices created in the secondary storage cluster.                                                                                                                                                                                                              | `-`           |
| `orchestration.data.secondaryStorage.opensearch.aws.enabled`                                                                                         | Use Basic authentication or AWS credentials to log in.Set to `false` to use Basic authentication for OpenSearch.Set to `true` to log in with AWS credentials.                                                               | `false`       |

**Note**
Set `orchestration.data.secondaryStorage.type` to a single backend.
To run in engine-only mode without secondary storage, set `global.noSecondaryStorage=true`.
The `global.elasticsearch.*` and `global.opensearch.*` values were removed in Camunda 8.10. See the [8.9 to 8.10 upgrade guide](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100#migrate-globalelasticsearch-and-globalopensearch) for the migration mapping.

  

**Note**
Set `indexPrefix` only if you need to separate Orchestration Cluster indices from other indices in the same cluster (for example, when multiple Camunda environments share one cluster). Leave blank (`-`) to use the default.

#### Secure connection (HTTPS / TLS)

To connect to a secured (`https`) Elasticsearch or OpenSearch cluster for secondary storage:

- Change the URL protocol from `http` to `https`.
- Provide `username` and `password` if the cluster requires authentication.
- Use additional security properties to handle custom certificates or strict hostname verification:
  - Set `security.enabled=true` (or simply use an `https` URL if auto-detection applies) to activate SSL/TLS handling.
  - Use `security.certificatePath` when the server certificate is signed by a custom CA or is self-signed so the JVM can trust it.
  - Set `security.selfSigned=true` if the certificate is self-signed and the client logic requires this hint.
  - Keep `security.verifyHostname=true` for production. Disable it only temporarily to diagnose hostname/certificate mismatch issues.

**Note**
Import the certificate (or its issuing CA) into the JVM trust store if it is not already trusted.
For Kubernetes-based deployments, mount a trust store and point `certificatePath` to it.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
