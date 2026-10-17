# Audit log — Impact on secondary storage

When the audit log is active, a record is written to [secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index) for every applicable operation instance. By default, only user operations are tracked, not [client](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/architecture#clients) operations. With this default behavior, you can expect a 3.5% increase in disk usage.

**Warning**
The audit log is enabled by default. Because of the increase in resource usage on secondary storage, you may see increased costs associated with this feature.

You can configure the audit log to fine tune log thoroughness and resource usage according to your needs:

- [SaaS](https://docs.camunda.io/docs/next/components/saas/clusters/configure-audit-log)
- [Self-Managed](https://docs.camunda.io/docs/next/self-managed/concepts/audit-log/configure)

---
Source: https://docs.camunda.io/docs/next/components/audit-log/overview
