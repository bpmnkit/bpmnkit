# Use external PostgreSQL — Configuration

Management Identity and Camunda Hub require PostgreSQL. Configure each component to connect to the external PostgreSQL instance. Keycloak's database is configured where Keycloak is deployed (operator or external), not through the Helm chart.

### Parameters

| values.yaml option                                             | type    | default | description                                                              |
| -------------------------------------------------------------- | ------- | ------- | ------------------------------------------------------------------------ |
| `camundaHub.restapi.externalDatabase.url`                      | string  | `""`    | JDBC URL of the database                                                 |
| `camundaHub.restapi.externalDatabase.username`                 | string  | `""`    | Username of the database                                                 |
| `camundaHub.restapi.externalDatabase.secret.existingSecret`    | string  | `""`    | Kubernetes Secret name containing a database password                    |
| `camundaHub.restapi.externalDatabase.secret.existingSecretKey` | string  | `""`    | Key within the Kubernetes Secret that has the database password          |
| `camundaHub.restapi.externalDatabase.secret.inlineSecret`      | string  | `""`    | String literal of the database password if not using a Kubernetes Secret |
| `identity.externalDatabase.enabled`                            | boolean | `false` | Enable the externalDatabase options                                      |
| `identity.externalDatabase.host`                               | string  | `""`    | Hostname of the database                                                 |
| `identity.externalDatabase.port`                               | integer | `5432`  | Port of the database                                                     |
| `identity.externalDatabase.username`                           | string  | `""`    | Username of the database                                                 |
| `identity.externalDatabase.secret.existingSecret`              | string  | `""`    | Kubernetes Secret name containing database password                      |
| `identity.externalDatabase.secret.existingSecretKey`           | string  | `""`    | Key within the Kubernetes Secret that contains the database password     |
| `identity.externalDatabase.database`                           | string  | `""`    | Database name                                                            |

### Example usage

```yaml
camundaHub:
  enabled: true
  restapi:
    externalDatabase:
      url: "jdbc:postgresql://db.example.com:5432/web-modeler"
      username: "postgres"
      secret:
        existingSecret: "camunda-psql-db"
        existingSecretKey: "password"

identity:
  externalDatabase:
    enabled: true
    host: "db.example.com"
    port: 5432
    username: "postgres"
    secret:
      existingSecret: "camunda-psql-db"
      existingSecretKey: "password"
    database: "management-identity"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-existing-postgres
