# Secondary storage — Choosing a secondary storage backend

Camunda supports multiple secondary storage backends, and the right choice depends on your workload and operational constraints.

For guidance on supported vendors, versions, and configuration, see:

- [Secondary storage configuration](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/configuring-secondary-storage)
- [RDBMS configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms)
- [RDBMS version support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy)
- [RDBMS benchmark results](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/rdbms-benchmark-results)

**Note**
The documentation is intentionally descriptive rather than prescriptive. Use benchmarking and sizing based on your own workload to choose the secondary storage backend that best meets your requirements.

**Note**
Although you should use secondary storage in nearly all production environments, you can choose to disable secondary storage in limited scenarios, such as lightweight development environments, specialized technical use cases, or resource-constrained deployments. See [run without secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/no-secondary-storage).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index
