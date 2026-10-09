# Helm charts secret management — Application secrets

These secrets are used by Camunda applications and external integrations. Configure them manually when using external secrets.

### Secrets using the structured pattern

| **Secret**                                      | **Chart values key**                                            | **Type** | **Purpose**                                                                      |
| ----------------------------------------------- | --------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| **Enterprise License Key**                      | `global.license.secret`                                         | Internal | Camunda Enterprise license key                                                   |
| **Identity First User Password**                | `identity.firstUser.secret`                                     | Internal | Default user password (`demo/demo`)                                              |
| **OAuth Client Secret (Admin)**                 | `global.identity.auth.admin.secret`                             | Internal | OAuth admin client secret for administrative operations                          |
| **OAuth Client Secret (Connectors)**            | `connectors.security.authentication.oidc.secret`                | Internal | OAuth client secret for connectors                                               |
| **OAuth Client Secret (Orchestration)**         | `orchestration.security.authentication.oidc.secret`             | Internal | OAuth client secret for Orchestration Cluster                                    |
| **OAuth Client Secret (Optimize)**              | `global.identity.auth.optimize.secret`                          | Internal | OAuth client secret for Optimize                                                 |
| **Identity External Database Password**         | `identity.externalDatabase.secret`                              | External | Password for external PostgreSQL when using an external database for Identity    |
| **Camunda Hub External Database Password**      | `camundaHub.restapi.externalDatabase.secret`                    | External | Password for external PostgreSQL when using an external database for Camunda Hub |
| **SMTP Password**                               | `camundaHub.restapi.mail.secret`                                | External | SMTP credentials for sending email notifications                                 |
| **RDBMS Auth**                                  | `orchestration.data.secondaryStorage.rdbms.secret`              | External | Password for external RDBMS authentication (Basic authentication)                |
| **External Elasticsearch Auth (Orchestration)** | `orchestration.data.secondaryStorage.elasticsearch.auth.secret` | External | Password for external Elasticsearch authentication (Basic authentication)        |
| **External OpenSearch Auth (Orchestration)**    | `orchestration.data.secondaryStorage.opensearch.auth.secret`    | External | Password for external OpenSearch authentication (Basic authentication)           |
| **External Elasticsearch Auth (Optimize)**      | `optimize.database.elasticsearch.auth.secret`                   | External | Password for external Elasticsearch authentication (Basic authentication)        |
| **External OpenSearch Auth (Optimize)**         | `optimize.database.opensearch.auth.secret`                      | External | Password for external OpenSearch authentication (Basic authentication)           |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management
