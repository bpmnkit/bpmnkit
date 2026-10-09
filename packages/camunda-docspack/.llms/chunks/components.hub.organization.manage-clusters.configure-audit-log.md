# Configure the audit log

Configure the audit log to determine which user and client operations are recorded.

Configure the [audit log](https://docs.camunda.io/docs/next/components/audit-log/overview) in Camunda 8 SaaS.


## About

The audit log is an important feature with which you can meet regulatory requirements and maintain operational integrity by accessing a record of operations. These records include who performed the operations, when, and on which entities.

The audit log is enabled by default, and the storage it requires may result in increased costs. To mitigate these resource costs, only user operations are tracked by default, not [client](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/architecture#clients) operations.

In Camunda 8 SaaS, you can change the default behavior in Camunda Hub. You can choose which user and client operations are recorded to fine-tune log thoroughness and resource usage according to your needs. You can also disable the audit log.

**Note**
This feature is only available for SaaS clusters using Camunda 8.9 and above. If you're using Camunda 8 Self-Managed, see the [Self-Managed guide](https://docs.camunda.io/docs/next/self-managed/concepts/audit-log/configure).

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/configure-audit-log
