# Analytics Exporter — What data is sent — Resource attributes

Attached to every record, metric point, and heartbeat:

| Attribute                    | Type   | Description                                                      |
| ---------------------------- | ------ | ---------------------------------------------------------------- |
| `camunda.cluster.id`         | string | Cluster identifier.                                              |
| `camunda.partition.id`       | long   | Partition ID.                                                    |
| `camunda.tenant.physical_id` | string | Physical tenant of the broker instance that produced the signal. |
| `service.name`               | string | Always `camunda-zeebe`.                                          |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
