# Use external Elasticsearch for Orchestration Cluster with Helm — Prerequisites — Parameters

#### Orchestration Cluster secondary storage

| values.yaml option                                                                | type   | default | description                                                                                           |
| --------------------------------------------------------------------------------- | ------ | ------- | ----------------------------------------------------------------------------------------------------- |
| `orchestration.data.secondaryStorage.type`                                        | string | `""`    | Type of secondary storage. Set to `elasticsearch` to use Elasticsearch.                               |
| `orchestration.data.secondaryStorage.elasticsearch.url`                           | string | `""`    | URL for the Elasticsearch cluster as `scheme://host:port` (for example, `http://elasticsearch:9200`). |
| `orchestration.data.secondaryStorage.elasticsearch.auth.username`                 | string | `""`    | Username for Elasticsearch authentication.                                                            |
| `orchestration.data.secondaryStorage.elasticsearch.auth.secret.inlineSecret`      | string | `""`    | Elasticsearch password as a plain-text value (non-production only).                                   |
| `orchestration.data.secondaryStorage.elasticsearch.auth.secret.existingSecret`    | string | `""`    | Reference to an existing Kubernetes Secret containing the password.                                   |
| `orchestration.data.secondaryStorage.elasticsearch.auth.secret.existingSecretKey` | string | `""`    | Key within the existing Kubernetes Secret containing the password.                                    |
| `orchestration.data.secondaryStorage.elasticsearch.tls.secret.existingSecret`     | string | `""`    | Reference to an existing Kubernetes Secret containing the TLS trust store.                            |
| `orchestration.data.secondaryStorage.elasticsearch.tls.secret.existingSecretKey`  | string | `""`    | Key within the existing Kubernetes Secret for the TLS trust store.                                    |
| `orchestration.index.prefix`                                                      | string | `""`    | Index prefix in Elasticsearch for the new Camunda exporter and the Orchestration Cluster.             |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/using-external-elasticsearch
