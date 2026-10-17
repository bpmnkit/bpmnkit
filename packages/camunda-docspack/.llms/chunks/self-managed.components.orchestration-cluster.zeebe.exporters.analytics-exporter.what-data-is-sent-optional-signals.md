# Analytics Exporter — What data is sent — Optional signals

**`camunda.user_task.created`**: a user task was created.

| Attribute                        | Type   | Description                       |
| -------------------------------- | ------ | --------------------------------- |
| `camunda.process.id`             | string | BPMN process ID.                  |
| `camunda.process.definition_key` | long   | Process definition key.           |
| `camunda.process.instance_key`   | long   | Process instance key.             |
| `camunda.element.id`             | string | BPMN element ID of the user task. |
| `camunda.tenant.id`              | string | Tenant ID.                        |

**`camunda.process.incident.created`** and **`camunda.process.incident.resolved`**

| Attribute                        | Type   | Description             |
| -------------------------------- | ------ | ----------------------- |
| `camunda.incident.key`           | long   | Incident key.           |
| `camunda.process.id`             | string | BPMN process ID.        |
| `camunda.process.definition_key` | long   | Process definition key. |
| `camunda.process.instance_key`   | long   | Process instance key.   |
| `camunda.tenant.id`              | string | Tenant ID.              |

**The incident error message is not exported**, because it can quote expressions and variable values.

**`camunda.process.definition.created`** and **`camunda.process.definition.deleted`**

| Attribute                        | Type   | Description             |
| -------------------------------- | ------ | ----------------------- |
| `camunda.process.id`             | string | BPMN process ID.        |
| `camunda.process.version`        | long   | Process version.        |
| `camunda.process.definition_key` | long   | Process definition key. |
| `camunda.tenant.id`              | string | Tenant ID.              |

The BPMN resource, resource name, and version tag are not exported.

**`camunda.decision.definition.created`** and **`camunda.decision.definition.deleted`**

| Attribute                  | Type   | Description               |
| -------------------------- | ------ | ------------------------- |
| `camunda.decision.id`      | string | Decision ID from the DMN. |
| `camunda.decision.key`     | long   | Decision key.             |
| `camunda.decision.version` | long   | Decision version.         |
| `camunda.tenant.id`        | string | Tenant ID.                |

The decision name and version tag are not exported.

**`camunda.form.definition.created`** and **`camunda.form.definition.deleted`**

| Attribute              | Type   | Description   |
| ---------------------- | ------ | ------------- |
| `camunda.form.id`      | string | Form ID.      |
| `camunda.form.key`     | long   | Form key.     |
| `camunda.form.version` | long   | Form version. |
| `camunda.tenant.id`    | string | Tenant ID.    |

The form resource, resource name, and version tag are not exported.

**`camunda.agent.instance.created`** and **`camunda.agent.instance.completed`**

| Attribute                           | Type   | Description                                                       |
| ----------------------------------- | ------ | ----------------------------------------------------------------- |
| `camunda.agent.instance_key`        | long   | Agent instance key.                                               |
| `camunda.agent.definition_key`      | long   | Agent definition key.                                             |
| `camunda.agent.status`              | string | Agent instance status, for example `INITIALIZING` or `COMPLETED`. |
| `camunda.process.id`                | string | BPMN process ID.                                                  |
| `camunda.process.definition_key`    | long   | Process definition key.                                           |
| `camunda.process.instance_key`      | long   | Process instance key.                                             |
| `camunda.process.root_instance_key` | long   | Root process instance key.                                        |
| `camunda.tenant.id`                 | string | Tenant ID.                                                        |

The agent definition (model, provider, system prompt), its tools, its token counts and other collected metrics, and its configured limits are **not** exported.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/analytics-exporter
