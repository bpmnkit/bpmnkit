# Recorded operations

Learn more about which operations are recorded in the audit log.

Learn more about which operations are recorded in the audit log.


## Limitations and constraints

The audit log contains operations performed using:

- [Operate](https://docs.camunda.io/docs/next/components/operate/userguide/audit-operations), [Admin](https://docs.camunda.io/docs/next/components/admin/audit-operations), and [Tasklist](https://docs.camunda.io/docs/next/components/tasklist/userguide/audit-task-history)
- [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-audit-logs.api)

However, only operations that are authenticated, authorized, and reach execution with a success or execution‑time failure are recorded. Operations rejected before execution are not recorded in the audit log.

Additionally, only user operations are tracked by default, not [client](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/architecture#clients) operations. Unlike the other constraints, you can configure this behavior.

---
Source: https://docs.camunda.io/docs/next/components/audit-log/overview/recorded-operations
