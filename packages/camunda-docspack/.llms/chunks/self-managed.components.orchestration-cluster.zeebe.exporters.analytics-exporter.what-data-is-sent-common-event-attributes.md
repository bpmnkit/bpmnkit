# Analytics Exporter — What data is sent — Common event attributes

Set on every event record:

| Attribute                       | Type   | Description                                                           |
| ------------------------------- | ------ | --------------------------------------------------------------------- |
| `event.name`                    | string | Signal identifier.                                                    |
| `camunda.log.position`          | long   | Log stream position. Used for deduplication.                          |
| `camunda.event.sequence_number` | long   | Monotonic per-partition counter, used for ordering and gap detection. |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
