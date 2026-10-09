# Command reference — Commands — `list`

List resources

**Resources:** pi (process-instance), pd (process-definition), ut (user-task), inc (incident), jobs, profiles (profile), plugins (plugin), users (user), roles (role), groups (group), tenants (tenant), auth (authorization), mapping-rules (mapping-rule)

**Verb-level flags:**

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--all` | boolean |  | List all (disable pagination limit) |

**Resource-specific flags:**

process-definition (pd)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--bpmnProcessId` | string |  | Filter by BPMN process ID |
| `--id` | string |  | Filter by BPMN process ID (alias) |
| `--processDefinitionId` | string |  | Filter by process definition ID |
| `--name` | string |  | Filter by name |
| `--key` | string |  | Filter by key |
| `--iid` | string |  | Case-insensitive filter by BPMN process ID |
| `--iname` | string |  | Case-insensitive filter by name |

process-instance (pi)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--businessId` | string |  | Filter by Business ID (Camunda 8.9+) |
| `--bpmnProcessId` | string |  | Filter by BPMN process ID |
| `--id` | string |  | Filter by BPMN process ID (alias) |
| `--processDefinitionId` | string |  | Filter by process definition ID |
| `--processDefinitionKey` | string |  | Filter by process definition key |
| `--state` | string |  | Filter by state (ACTIVE, COMPLETED, etc) |
| `--key` | string |  | Filter by key |
| `--parentProcessInstanceKey` | string |  | Filter by parent process instance key |
| `--iid` | string |  | Case-insensitive filter by BPMN process ID |

user-task (ut)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--state` | string |  | Filter by state |
| `--assignee` | string |  | Filter by assignee |
| `--processInstanceKey` | string |  | Filter by process instance key |
| `--processDefinitionKey` | string |  | Filter by process definition key |
| `--elementId` | string |  | Filter by element ID |
| `--iassignee` | string |  | Case-insensitive filter by assignee |

incident (inc)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--state` | string |  | Filter by state |
| `--processInstanceKey` | string |  | Filter by process instance key |
| `--processDefinitionKey` | string |  | Filter by process definition key |
| `--bpmnProcessId` | string |  | Filter by BPMN process ID |
| `--id` | string |  | Filter by BPMN process ID (alias) |
| `--processDefinitionId` | string |  | Filter by process definition ID |
| `--errorType` | string |  | Filter by error type |
| `--errorMessage` | string |  | Filter by error message |
| `--ierrorMessage` | string |  | Case-insensitive filter by error message |
| `--iid` | string |  | Case-insensitive filter by BPMN process ID |

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
