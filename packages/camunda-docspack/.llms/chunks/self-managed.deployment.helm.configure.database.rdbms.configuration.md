# Configure RDBMS in Helm chart — Configuration

### Connection parameters (required)

| Parameter                                            | Type   | Default | Description                                   |
| ---------------------------------------------------- | ------ | ------- | --------------------------------------------- |
| `orchestration.data.secondaryStorage.type`           | string | `""`    | Must be `rdbms` to use a relational database. |
| `orchestration.data.secondaryStorage.rdbms.url`      | string | `""`    | JDBC connection URL for the database.         |
| `orchestration.data.secondaryStorage.rdbms.username` | string | `""`    | Username for database authentication.         |

### Database credentials

Store the database password in a Kubernetes secret and reference it. For testing only, you can use `inlineSecret`.

| Parameter                                                            | Type   | Default | Description                                         |
| -------------------------------------------------------------------- | ------ | ------- | --------------------------------------------------- |
| `orchestration.data.secondaryStorage.rdbms.secret.existingSecret`    | string | `""`    | Name of Kubernetes secret containing the password.  |
| `orchestration.data.secondaryStorage.rdbms.secret.existingSecretKey` | string | `""`    | Key within the secret storing the password.         |
| `orchestration.data.secondaryStorage.rdbms.secret.inlineSecret`      | string | `""`    | Password value (testing only, not production-safe). |

### Other parameters

RDBMS supports other configuration options that can be configured in the helm chart `values.yaml` via [extraConfiguration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs). See [RDBMS options](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration).

For Liquibase lock recovery behavior, configure `camunda.data.secondary-storage.rdbms.ddl-lock-wait-timeout` (default: `PT15M`) via `extraConfiguration` if you need a longer wait time for heavy schema migrations.

### Example usage

**Note**
RDBMS is fully supported as secondary storage. For production planning, review the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy).

```yaml
orchestration:
  exporters:
    camunda:
      enabled: false
    rdbms:
      enabled: true
  data:
    secondaryStorage:
      type: rdbms
      rdbms:
        url: jdbc:postgresql://hostname:5432/camunda
        username: camunda
        secret:
          existingSecret: camunda-db-secret
          existingSecretKey: password
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms
