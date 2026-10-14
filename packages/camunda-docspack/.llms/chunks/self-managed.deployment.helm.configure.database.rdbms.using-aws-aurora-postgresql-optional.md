# Configure RDBMS in Helm chart — Using AWS Aurora PostgreSQL (optional)

If you are using AWS Aurora PostgreSQL as your relational database, you can configure it the same way as a standard PostgreSQL instance.

Optionally, Camunda also supports the AWS JDBC wrapper driver, which provides additional features such as improved failover handling and IAM-based authentication.

For details and examples, see [using AWS Aurora PostgreSQL with Camunda](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#usage-with-aws-aurora-postgresql--mysql).


## Limitations and unsupported scenarios

### Component-specific RDBMS support

- **Orchestration Cluster**: ✅ Full RDBMS support for secondary storage (includes Zeebe, Operate, Tasklist, Orchestration Identity).
- **Connectors**: ✅ Supports RDBMS for process definitions and state.
- **Camunda Hub**: ✅ Supports RDBMS.
- **Optimize**: ❌ **Requires Elasticsearch or OpenSearch only.** Optimize cannot use RDBMS.

If you deploy Optimize, you must still provision Elasticsearch or OpenSearch.

### Multi-region deployments

Deploy the RDBMS in the same region as your Kubernetes cluster. To run one Orchestration Cluster across several regions, follow the [Multi-Region RDBMS](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms) architecture, which delegates replication of the secondary storage to the database. Review its requirements and limitations first.

### Self-managed database HA

Camunda assumes your RDBMS handles its own HA (replication, failover). Use cloud-managed databases or vendor-specific HA solutions for production.

### Custom JDBC driver libraries

Only JDBC drivers from official vendor sources are supported. Custom or modified drivers may cause unexpected behavior.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms
