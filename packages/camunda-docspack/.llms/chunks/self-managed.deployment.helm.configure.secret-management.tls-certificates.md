# Helm charts secret management — TLS certificates

TLS certificate secrets for Camunda components and external services.

**Note: Migrating from legacy TLS secret configuration**
The structured `secret:` pattern for TLS certificates was introduced in Camunda 8.9. If you are upgrading from an earlier version and using legacy TLS secret fields (such as `global.elasticsearch.tls.existingSecret`), see the [8.8 secret management guide](https://docs.camunda.io/docs/next/versioned_docs/version-8.8/self-managed/deployment/helm/configure/secret-management) for migration instructions.

### TLS certificate secrets

| **Secret**                          | **Chart values key**                                                                                          | **Purpose**                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Console TLS Certificate**         | `console.tls.secret`                                                                                          | TLS certificate for Console web application         |
| **External Elasticsearch TLS Cert** | `orchestration.data.secondaryStorage.elasticsearch.tls.secret` / `optimize.database.elasticsearch.tls.secret` | TLS certificate for external Elasticsearch over SSL |
| **External OpenSearch TLS Cert**    | `orchestration.data.secondaryStorage.opensearch.tls.secret` / `optimize.database.opensearch.tls.secret`       | TLS certificate for external OpenSearch over SSL    |

**TLS Certificate Configuration**: Unlike password-based secrets, TLS certificates do not support `inlineSecret` (certificates are binary files unsuitable for inline configuration).

For Elasticsearch and OpenSearch, both `existingSecret` and `existingSecretKey` are required to specify which key in the secret contains the certificate file. For Console, only `existingSecret` is required as the entire secret is mounted as a directory.

Create the secrets with your certificate files using `kubectl create secret generic`:

```sh
kubectl create secret generic <secret-name> \
  --from-file=<key>=<path-to-certificate-file> \
  --namespace camunda
```

Reference them in your values:

```yaml
# Elasticsearch/OpenSearch
orchestration:
  data:
    secondaryStorage:
      type: elasticsearch
      elasticsearch:
        tls:
          secret:
            existingSecret: elasticsearch-tls-secret
            existingSecretKey: externaldb.jks

# Console
console:
  tls:
    enabled: true
    secret:
      existingSecret: console-tls-secret
    certKeyFilename: ca.crt
```

### Ingress TLS

Configure TLS for Camunda services exposed via Ingress:

```yaml
global:
  ingress:
    tls:
      enabled: true
      secretName: camunda-platform
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management
