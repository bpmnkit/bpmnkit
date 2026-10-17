# Dual-region setup (ECS Fargate) — Architecture decisions — Secondary storage engine

The `db_engine` variable in `terraform/infra/terraform.tfvars` selects the Aurora engine for RDBMS secondary storage. It drives the Aurora clusters, the security group rules, the IAM database user seeding, and the generated JDBC URL. Choose the engine before the first `terraform apply`. Camunda doesn't support in-place migration between secondary storage backends, so switching engines later means creating a new deployment.

| `db_engine` value      | Aurora engine       | Port |
| ---------------------- | ------------------- | ---- |
| `postgresql` (default) | `aurora-postgresql` | 5432 |
| `mysql`                | `aurora-mysql`      | 3306 |

**Warning**
Changing `db_engine` on an existing deployment replaces the global cluster and both regional clusters without a final snapshot. All secondary storage data is permanently lost.

The published Camunda image doesn't include the MySQL JDBC driver. To use `db_engine = "mysql"`, build a custom image that adds it. See [user-supplied drivers](https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/configuration#user-supplied-drivers-oracle-mysql).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
