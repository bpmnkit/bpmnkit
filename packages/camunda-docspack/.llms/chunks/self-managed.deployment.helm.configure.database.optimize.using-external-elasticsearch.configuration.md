# Use external Elasticsearch for Optimize with Helm — Configuration

### Parameters

Use the following Helm values for Optimize's Elasticsearch connection:

| values.yaml option                                              | type    | default          | description                                                                                                                                                                                                     |
| --------------------------------------------------------------- | ------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `optimize.database.elasticsearch.enabled`                       | boolean | `false`          | Enables Elasticsearch for Optimize.                                                                                                                                                                             |
| `optimize.database.elasticsearch.external`                      | boolean | `false`          | Set to `true` to connect to an external Elasticsearch instance.                                                                                                                                                 |
| `optimize.database.elasticsearch.auth.username`                 | string  | `""`             | Username for external Elasticsearch authentication.                                                                                                                                                             |
| `optimize.database.elasticsearch.auth.secret.inlineSecret`      | string  | `""`             | Elasticsearch password as a plain-text value for non-production environments only.                                                                                                                              |
| `optimize.database.elasticsearch.auth.secret.existingSecret`    | string  | `""`             | Reference to an existing Kubernetes Secret containing the password.                                                                                                                                             |
| `optimize.database.elasticsearch.auth.secret.existingSecretKey` | string  | `""`             | Key within the existing Kubernetes Secret containing the password.                                                                                                                                              |
| `optimize.database.elasticsearch.prefix`                        | string  | `zeebe-record`   | Index prefix for `zeebe-record` indices. See [configure Elasticsearch and OpenSearch index prefixes](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/configure-elasticsearch-prefix-indices). |
| `optimize.database.elasticsearch.tls.enabled`                   | boolean | `false`          | Enables TLS when connecting to Elasticsearch.                                                                                                                                                                   |
| `optimize.database.elasticsearch.tls.secret.existingSecret`     | string  | `""`             | Name of the Kubernetes Secret containing a TLS certificate.                                                                                                                                                     |
| `optimize.database.elasticsearch.tls.secret.existingSecretKey`  | string  | `externaldb.jks` | Key within the secret containing the TLS certificate.                                                                                                                                                           |
| `optimize.database.elasticsearch.url.protocol`                  | string  | `""`             | Protocol to use when connecting to Elasticsearch. Possible values are `http` and `https`.                                                                                                                       |
| `optimize.database.elasticsearch.url.host`                      | string  | `""`             | Hostname or IP address of the Elasticsearch instance.                                                                                                                                                           |
| `optimize.database.elasticsearch.url.port`                      | integer | `0`              | Port number of the Elasticsearch instance.                                                                                                                                                                      |

### Example usage

#### Connect Optimize to external Elasticsearch without a certificate

```yaml
optimize:
  enabled: true
  database:
    elasticsearch:
      enabled: true
      external: true
      auth:
        username: elastic
        secret:
          inlineSecret: pass
      url:
        protocol: http
        host: elastic.example.com
        port: 443
```

#### Connect Optimize to external Elasticsearch with a self-signed certificate

If the Elasticsearch cluster accepts only `https` requests with a self-signed certificate:

1. Create an `externaldb.jks` file from the Elasticsearch certificate file. For example, using the `keytool` CLI:

   ```yaml
   keytool -import -alias elasticsearch -keystore externaldb.jks -storetype jks -file elastic.crt -storepass changeit -noprompt
   ```

1. Create a Kubernetes secret from the `externaldb.jks` file before installing Camunda:

   ```yaml
   kubectl create secret -n camunda generic elastic-jks --from-file=externaldb.jks
   ```

1. Configure Optimize:

   ```yaml
   optimize:
     enabled: true
     database:
       elasticsearch:
         enabled: true
         external: true
         tls:
           enabled: true
           secret:
             existingSecret: elastic-jks
         auth:
           username: elastic
           secret:
             inlineSecret: pass
         url:
           protocol: https
           host: elastic.example.com
           port: 443
   ```

#### Connect Optimize to external Elasticsearch with a publicly trusted certificate

```yaml
optimize:
  enabled: true
  database:
    elasticsearch:
      enabled: true
      external: true
      auth:
        username: elastic
        secret:
          inlineSecret: pass
      url:
        protocol: https
        host: elastic.example.com
        port: 443
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/using-external-elasticsearch
