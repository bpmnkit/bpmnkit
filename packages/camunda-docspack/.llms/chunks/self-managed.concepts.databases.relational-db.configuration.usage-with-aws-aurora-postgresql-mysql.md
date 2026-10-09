# RDBMS configuration overview — Usage with AWS Aurora PostgreSQL / MySQL

Camunda supports **PostgreSQL** and **MySQL** as secondary storage backends. AWS Aurora PostgreSQL and AWS Aurora MySQL are compatible managed services and work when you configure them like standard PostgreSQL or MySQL databases.

In addition to the standard PostgreSQL and MySQL JDBC drivers, you can use the **AWS Advanced JDBC Wrapper** to take advantage of Aurora-specific features such as improved failover handling and IAM-based authentication.

To use the AWS JDBC wrapper with an Aurora PostgreSQL database, configure the JDBC URL for your Aurora engine:

```yaml
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:aws-wrapper:postgresql://aurora-postgresql-host:5432/camunda
        username: camunda
        password: camunda
```

To use the AWS JDBC wrapper with an Aurora MySQL database, configure the JDBC URL for your Aurora engine:

```yaml
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:aws-wrapper:mysql://aurora-mysql-host:3306/camunda
        username: camunda
        password: camunda
```

The AWS JDBC wrapper supports standard username/password authentication as well as IAM-based authentication.

To use IAM authentication, enable the corresponding wrapper plugin and configure a database user without a password that has the required IAM permissions:

```yaml
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:aws-wrapper:postgresql://aurora-host:5432/camunda?wrapperPlugins=iam
        username: camunda
```

The AWS JDBC wrapper supports automatic failover detection when using Aurora GlobalDB.

To use automatic failover detection, enable the corresponding wrapper plugin and optionally configure a failover timeout:

```yaml
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:aws-wrapper:postgresql://aurora-host:5432/camunda?wrapperPlugins=failover
```

In addition, you can override the default failoverTimeoutMs (60 seconds) by adding the `failoverTimeoutMs` parameter to
the JDBC URL: `jdbc:aws-wrapper:postgresql://aurora-host:5432/camunda?wrapperPlugins=failover&failoverTimeoutMs=30000`.

````yaml

The AWS JDBC wrapper JAR is shipped with the Camunda distribution alongside most of the other JDBC drivers. There is no need to provide it separately.

### Per-physical-tenant credentials on Aurora

When using [physical tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index), each tenant can connect to Aurora with its own database user. Database-level permissions (schema grants, row-level security) are administered entirely in PostgreSQL, so tenant isolation is enforced by the database rather than by the application.

For standard username/password authentication, override the connection settings per tenant:

```yaml
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:aws-wrapper:postgresql://aurora-host:5432/camunda?currentSchema=default_schema
        username: camunda
        password: camunda
  physical-tenants:
    tenanta:
      data:
        secondary-storage:
          rdbms:
            url: jdbc:aws-wrapper:postgresql://aurora-host:5432/camunda?currentSchema=tenant_a_schema
            username: tenant_a_user
            password: tenant-a-secret
````

For IAM authentication, the same pattern applies with the `iam` wrapper plugin and passwordless database users:

```yaml
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:aws-wrapper:postgresql://aurora-host:5432/camunda?wrapperPlugins=iam&currentSchema=default_schema
        username: camunda
  physical-tenants:
    tenanta:
      data:
        secondary-storage:
          rdbms:
            url: jdbc:aws-wrapper:postgresql://aurora-host:5432/camunda?wrapperPlugins=iam&currentSchema=tenant_a_schema
            username: tenant_a_user
```

With IAM authentication, the wrapper driver generates short-lived authentication tokens using the application's AWS identity (for example, the pod's IAM role when running on EKS with IRSA). The IAM permission `rds-db:connect` is granted **per database user**, so the single application identity is granted access to exactly the tenant database users it should reach — one AWS identity, many tenant-scoped database users.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
