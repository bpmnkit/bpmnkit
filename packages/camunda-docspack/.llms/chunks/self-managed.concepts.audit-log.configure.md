# Configure the audit log

Configure the audit log in Camunda 8 Self-Managed.

Configure the audit log in Camunda 8 Self-Managed.


## Configure recorded operations

The audit log is an important feature with which you can meet regulatory requirements and maintain operational integrity by accessing a record of operations. These records include who performed the operations, when, and on which entities.

The audit log is enabled by default, and the storage it requires may result in increased costs. To mitigate these resource costs, only user operations are tracked by default, not [client](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/architecture#clients) operations.

To change the default behavior in Camunda 8 Self-Managed, such as to disable the audit log or configure recorded operations, you must configure your deployment:

### application.yaml

```yaml
camunda:
  data:
    audit-log:
      enabled: true
      user:
        categories: [DEPLOYED_RESOURCES, USER_TASKS, ADMIN] # User operations are recorded by default
      client:
        categories: [DEPLOYED_RESOURCES, USER_TASKS, ADMIN] # You must opt in to client operations
```

### env

```bash
CAMUNDA_DATA_AUDITLOG_ENABLED=true

# User operations are recorded by default
CAMUNDA_DATA_AUDITLOG_USER_CATEGORIES_0=DEPLOYED_RESOURCES
CAMUNDA_DATA_AUDITLOG_USER_CATEGORIES_1=USER_TASKS
CAMUNDA_DATA_AUDITLOG_USER_CATEGORIES_2=ADMIN

# You must opt in to client operations
CAMUNDA_DATA_AUDITLOG_CLIENT_CATEGORIES_0=DEPLOYED_RESOURCES
CAMUNDA_DATA_AUDITLOG_CLIENT_CATEGORIES_1=USER_TASKS
CAMUNDA_DATA_AUDITLOG_CLIENT_CATEGORIES_2=ADMIN
```

### helm

```yaml
orchestration:
  extraConfiguration:
    - file: additional-spring-properties.yaml
      content: |
        camunda:
          data:
            audit-log:
              enabled: true
              user:
                categories: [DEPLOYED_RESOURCES, USER_TASKS, ADMIN] # User operations are recorded by default
              client:
                categories: [DEPLOYED_RESOURCES, USER_TASKS, ADMIN] # You must opt in to client operations
```

See [all configuration options](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundadataaudit-log) to learn more.

If you disable the audit log, new operations are no longer recorded. Changing this setting doesn't cause the existing audit log data to be immediately purged. Instead, it will be cleaned up according to the secondary storage retention settings. Until the data is cleaned up, you can continue to access the data in [Operate](https://docs.camunda.io/docs/next/components/operate/userguide/audit-operations), [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/userguide/audit-task-history), [Admin](https://docs.camunda.io/docs/next/components/admin/audit-operations), and the [Search API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-audit-logs.api).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/audit-log/configure
