# Use external Elasticsearch for Orchestration Cluster with Helm — Prerequisites — Example usage

#### Connect to external Elasticsearch without a certificate

Configure the Orchestration Cluster as follows:

```yaml
orchestration:
  data:
    secondaryStorage:
      type: elasticsearch
      elasticsearch:
        url: http://elastic.example.com:443
        auth:
          username: elastic
          secret:
            inlineSecret: pass

elasticsearch:
  enabled: false
```

#### Connect to external Elasticsearch with a self-signed certificate

If the Elasticsearch cluster accepts only `https` requests with a self-signed certificate:

1. Create an `externaldb.jks` file from the Elasticsearch certificate file. For example, using the `keytool` CLI:

   ```yaml
   keytool -import -alias elasticsearch -keystore externaldb.jks -storetype jks -file elastic.crt -storepass changeit -noprompt
   ```

1. Create a Kubernetes secret from the `externaldb.jks` file before installing Camunda:

   ```yaml
   kubectl  create secret -n camunda generic elastic-jks --from-file=externaldb.jks
   ```

1. Configure the Camunda 8 Self-Managed Helm chart:

   ```yaml
   orchestration:
     data:
       secondaryStorage:
         type: elasticsearch
         elasticsearch:
           url: https://elastic.example.com:443
           auth:
             username: elastic
             secret:
               inlineSecret: pass
           tls:
             secret:
               existingSecret: elastic-jks
               existingSecretKey: externaldb.jks

   elasticsearch:
     enabled: false
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/using-external-elasticsearch
