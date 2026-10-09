# Conceptual differences — Plugins

[**Process engine plugins**](https://docs.camunda.org/manual/latest/user-guide/process-engine/process-engine-plugins/) are not available in Camunda 8, as such plugins can massively change the behavior or even harm the stability of the engine. Some use cases might be implemented using [exporters](https://docs.camunda.io/docs/next/self-managed/concepts/exporters) or [interceptors](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/interceptors#implementing-an-interceptor).

**Note**
Exporters are only available for Self-Managed Zeebe clusters and are not available in Camunda 8 SaaS.

Migrating **Desktop Modeler Plugins** is generally possible, as the same modeler infrastructure is used.

**Cockpit or Tasklist plugins** _cannot_ be migrated.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences
