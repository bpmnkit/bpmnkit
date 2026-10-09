# Use external OpenSearch for Optimize with Helm — Prerequisites

Amazon OpenSearch requires two layers of permissions:

- AWS IAM permissions
- OpenSearch internal authentication

To connect to OpenSearch using AWS IAM roles for service accounts (IRSA), see the [IAM roles for service accounts documentation](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup#opensearch-module-setup).

To connect to OpenSearch using Basic authentication, follow the configuration below.


## Configuration

### Parameters

| Parameter                                                    | Type    | Default          | Description                                                                                                                                                                                                     |
| ------------------------------------------------------------ | ------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `optimize.database.opensearch.enabled`                       | boolean | `false`          | Enable external OpenSearch.                                                                                                                                                                                     |
| `optimize.database.opensearch.aws.enabled`                   | boolean | `false`          | Enable AWS IRSA integration.                                                                                                                                                                                    |
| `optimize.database.opensearch.auth.username`                 | string  | `""`             | Username for external OpenSearch authentication.                                                                                                                                                                |
| `optimize.database.opensearch.auth.secret.inlineSecret`      | string  | `""`             | OpenSearch password as a plain-text value (non-production only).                                                                                                                                                |
| `optimize.database.opensearch.auth.secret.existingSecret`    | string  | `""`             | Reference to an existing Kubernetes Secret containing the password.                                                                                                                                             |
| `optimize.database.opensearch.auth.secret.existingSecretKey` | string  | `""`             | Key within the existing Kubernetes Secret containing the password.                                                                                                                                              |
| `optimize.database.opensearch.prefix`                        | string  | `zeebe-record`   | Index prefix for `zeebe-record` indices. See [Configure Elasticsearch and OpenSearch index prefixes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices). |
| `optimize.database.opensearch.tls.enabled`                   | boolean | `false`          | Enable TLS for external OpenSearch.                                                                                                                                                                             |
| `optimize.database.opensearch.tls.secret.existingSecret`     | string  | `""`             | Name of the Kubernetes Secret containing a TLS certificate.                                                                                                                                                     |
| `optimize.database.opensearch.tls.secret.existingSecretKey`  | string  | `externaldb.jks` | Key within the secret containing the TLS certificate.                                                                                                                                                           |
| `optimize.database.opensearch.url.protocol`                  | string  | `""`             | Access protocol for OpenSearch. Possible values are `http` and `https`.                                                                                                                                         |
| `optimize.database.opensearch.url.host`                      | string  | `""`             | OpenSearch host, ideally the service name within the namespace.                                                                                                                                                 |
| `optimize.database.opensearch.url.port`                      | integer | `0`              | Port used to access OpenSearch.                                                                                                                                                                                 |

### Example usage

```yaml
optimize:
  enabled: true
  database:
    opensearch:
      enabled: true
      auth:
        username: user
        secret:
          # For non-production environments only:
          inlineSecret: "your-password-here"
          # For production (recommended):
          # existingSecret: "opensearch-secret"
          # existingSecretKey: "password"
      url:
        protocol: https
        host: opensearch.example.com
        port: 443
```

To avoid storing the username and password in plaintext in your `values.yaml`, reference a Kubernetes secret. For details and examples, see [Helm charts secret management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management).

### Connect Optimize to external OpenSearch with custom index prefixes

When running multiple Camunda instances on a shared OpenSearch cluster, use custom index prefixes to isolate data:

```yaml
optimize:
  enabled: true
  database:
    opensearch:
      enabled: true
      prefix: my-env-zeebe
      auth:
        username: admin
        secret:
          inlineSecret: pass
      url:
        protocol: https
        host: opensearch.example.com
        port: 443
```

For more details about index prefix configuration and matching exporter settings, see [configure Elasticsearch and OpenSearch index prefixes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/using-external-opensearch
