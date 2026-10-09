# Configure TLS — Configuring datastore TLS

`values-tls.yaml` ships commented templates for each datastore. Uncomment and fill in the section that matches your backend.

### Elasticsearch

```yaml
orchestration:
  data:
    secondaryStorage:
      type: elasticsearch
      elasticsearch:
        url: "https://your-elasticsearch.example.com:9200"
        auth:
          username: elastic
          secret:
            existingSecret: "your-elasticsearch-credentials"
            existingSecretKey: password

optimize:
  database:
    elasticsearch:
      enabled: true
      url:
        protocol: https
        host: "your-elasticsearch.example.com"
        port: 9200
      auth:
        username: elastic
        secret:
          existingSecret: "your-elasticsearch-credentials"
          existingSecretKey: password
```

**Note**
The Zeebe ElasticsearchExporter uses its own auth env path (`ZEEBE_BROKER_EXPORTERS_ELASTICSEARCH_ARGS_AUTHENTICATION_USERNAME` / `_PASSWORD`). `secondaryStorage.elasticsearch.auth` does not fill it — set those env vars via `orchestration.env` if needed.

### OpenSearch

```yaml
orchestration:
  data:
    secondaryStorage:
      type: opensearch
      opensearch:
        url: "https://your-opensearch.example.com:9200"
        auth:
          username: admin
          secret:
            existingSecret: "your-opensearch-credentials"
            existingSecretKey: password

optimize:
  database:
    opensearch:
      enabled: true
      aws:
        enabled: false # set true + remove auth.* for IRSA against AWS-managed OpenSearch
      url:
        protocol: https
        host: "your-opensearch.example.com"
        port: 9200
      auth:
        username: admin
        secret:
          existingSecret: "your-opensearch-credentials"
          existingSecretKey: password
```

For AWS-managed OpenSearch with IRSA, leave `auth` unset and configure `aws.enabled: true` plus the appropriate service account annotations.

### PostgreSQL (RDBMS exporter)

The CA is mounted at `/etc/camunda/tls/ca.crt` — reference it directly in the JDBC URL:

```yaml
orchestration:
  data:
    secondaryStorage:
      type: rdbms
      rdbms:
        url: "jdbc:postgresql://your-postgres.example.com:5432/orchestration?sslmode=verify-full&sslrootcert=/etc/camunda/tls/ca.crt"
        username: camunda
        secret:
          existingSecret: "your-postgres-credentials"
          existingSecretKey: password
```

### External OIDC issuer with private CA

Only required when your IdP uses a private or internal CA. Public-CA issuers (Entra, Google) work without additional configuration.

```yaml
global:
  identity:
    auth:
      issuerBackendUrl: "https://your-idp.example.com/realms/camunda"
      tokenUrl: "https://your-idp.example.com/realms/camunda/protocol/openid-connect/token"
      jwksUrl: "https://your-idp.example.com/realms/camunda/protocol/openid-connect/certs"
      authUrl: "https://your-idp.example.com/realms/camunda/protocol/openid-connect/auth"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls
