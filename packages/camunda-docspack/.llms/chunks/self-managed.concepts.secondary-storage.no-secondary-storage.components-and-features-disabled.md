# Run without secondary storage — Components and features disabled

If secondary storage is disabled, the following components and features are unavailable:

| Category         | Component or feature                                                               | Behavior               |
| :--------------- | :--------------------------------------------------------------------------------- | :--------------------- |
| Web applications | Operate, Tasklist, Admin UI, Optimize, Play (Modeler Play tab)                     | Disabled               |
| APIs & services  | Orchestration Cluster REST API (search endpoints), batch operations, usage metrics | Return `403 Forbidden` |
| Data & storage   | Secondary storage exporters, Schema Manager, secondary storage backups             | Disabled               |

**Note**

- Outbound connectors remain supported. However, inbound connectors and any features that require process definition lookup are unavailable.
- Custom exporters (for example, Kafka, Prometheus, or MongoDB) continue to work as they interact directly with the engine’s primary storage.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/no-secondary-storage
