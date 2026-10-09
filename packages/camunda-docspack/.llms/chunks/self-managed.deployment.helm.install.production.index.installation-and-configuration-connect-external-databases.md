# Install Camunda for production with Helm — Installation and configuration — Connect external databases

**Note**
Camunda 8.10 does not bundle databases. Provide PostgreSQL and Elasticsearch or OpenSearch through managed services or Kubernetes operators (see [operator-based infrastructure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure)), and use production-grade databases.

This guide keeps database configuration in one flow and provides two options:

- **Option A (Non-SQL secondary storage):** Use Elasticsearch or OpenSearch for the Orchestration Cluster secondary storage backend. This path is also required when deploying Optimize.
- **Option B (RDBMS secondary storage):** Use a relational database as secondary storage for supported components. For this path, follow [Configure RDBMS in Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms) and use the [RDBMS example deployment](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms) as a focused walkthrough.

The examples below use Option A with Amazon OpenSearch for secondary storage, and Amazon Aurora PostgreSQL for Management Identity and Web Modeler.

You should have one Amazon OpenSearch instance and one Amazon Aurora PostgreSQL instance (with two databases) ready to use, complete with a username, password, and URL for each datastore. If these have not been configured, see the [prerequisites](#prerequisites) for requirements.

#### Connecting to Amazon OpenSearch

The following example `values.yaml` configures OpenSearch as the secondary storage for the Orchestration Cluster, and points Optimize at the same cluster:

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
            existingSecret: opensearch-credentials
            existingSecretKey: password

optimize:
  enabled: true
  database:
    opensearch:
      enabled: true
      url:
        protocol: https
        host: opensearch.example.com
        port: 443
      auth:
        username: user
        secret:
          existingSecret: opensearch-credentials
          existingSecretKey: password
```

#### Connect to an external database for Management Identity

The following example `values.yaml` configures Management Identity with an external Amazon Aurora PostgreSQL database:

```yaml
identity:
  externalDatabase:
    enabled: true
    host: external-postgres-host
    port: 5432
    username: identity_user
    database: identity_db
    secret:
      existingSecret: identity-db-secret
      existingSecretKey: database-password
```

**Note**
Make sure the host and port are correctly defined.

#### Connect to an external database for Web Modeler

The following example `values.yaml` configures Web Modeler with an external Amazon Aurora PostgreSQL database:

```yaml
camundaHub:
  restapi:
    externalDatabase:
      url: jdbc:postgresql://external-postgres-host:5432/camunda_db
      username: web_modeler_user
      secret:
        existingSecret: web-modeler-db-secret
        existingSecretKey: database-password
```

Use the `existingSecret` parameter to specify a pre-existing Kubernetes secret containing the password. This approach allows the Camunda Helm chart to reference credentials stored securely in your cluster, rather than hardcoding sensitive data in values files or templates.

For more information on connecting to external databases, the following guides are available for the Camunda Helm chart:

- [Helm chart database configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/index)
- [Non-SQL database configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/non-sql)
- Using an [existing Elasticsearch instance](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/using-external-elasticsearch)
- Using [Amazon OpenSearch service](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-external-opensearch)
- [RDBMS configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms)
- Using Amazon OpenSearch service [through IRSA](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup#opensearch-module-setup) (only applicable if you are using EKS)
- Running Web Modeler on [Amazon Aurora PostgreSQL](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/database#running-camunda-hub-on-amazon-aurora-postgresql)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
