# Analytics Exporter — What data is sent — Contractual signals

**`camunda.process.instance.activated`**: a root process instance was activated.

| Attribute                           | Type   | Description                |
| ----------------------------------- | ------ | -------------------------- |
| `camunda.process.id`                | string | BPMN process ID.           |
| `camunda.process.version`           | long   | Deployed process version.  |
| `camunda.process.definition_key`    | long   | Process definition key.    |
| `camunda.process.instance_key`      | long   | Process instance key.      |
| `camunda.process.root_instance_key` | long   | Root process instance key. |
| `camunda.tenant.id`                 | string | Tenant ID.                 |

Taken from activation of the root process element, the single point every process instance passes through however it was started: client API, message, timer, signal, or conditional start event. Instances started by a call activity are excluded, so this counts root instances only.

**`camunda.user_task.assigned`**: a user task was assigned to a user. This signal carries no assignee-derived data; it only counts assignment events.

| Attribute                      | Type   | Description           |
| ------------------------------ | ------ | --------------------- |
| `camunda.user_task.key`        | long   | User task key.        |
| `camunda.process.instance_key` | long   | Process instance key. |
| `camunda.tenant.id`            | string | Tenant ID.            |

Assignments with an empty assignee produce no event.

**`camunda.tenant.created`** and **`camunda.tenant.deleted`**

| Attribute           | Type   | Description |
| ------------------- | ------ | ----------- |
| `camunda.tenant.id` | string | Tenant ID.  |

The tenant name, description, and associated entity are not exported.

**`camunda.decision.instance.evaluated`** (counter metric): pre-aggregated count of evaluated decision instances, dimensioned by `camunda.tenant.id`.

Counts evaluation records rather than the decisions inside them: a decision requiring sub-decisions counts once, and failed evaluations are not counted. This matches the counting rule for the decision instance usage metric.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
