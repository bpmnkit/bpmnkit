# Command reference — Commands — `search` (2)

variable (var, vars)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--name` | string |  | Filter by variable name |
| `--value` | string |  | Filter by value |
| `--processInstanceKey` | string |  | Filter by process instance key |
| `--scopeKey` | string |  | Filter by scope key |
| `--fullValue` | boolean |  | Return full variable values (not truncated) |
| `--iname` | string |  | Case-insensitive filter by name |
| `--ivalue` | string |  | Case-insensitive filter by value |

user

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--username` | string |  | Filter by username |
| `--name` | string |  | Filter by name |
| `--email` | string |  | Filter by email |

role

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--roleId` | string |  | Filter by role ID |
| `--name` | string |  | Filter by name |

group

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--groupId` | string |  | Filter by group ID |
| `--name` | string |  | Filter by name |

tenant

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--tenantId` | string |  | Filter by tenant ID |
| `--name` | string |  | Filter by name |

authorization (auth)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--ownerId` | string |  | Filter by owner ID |
| `--ownerType` | string |  | Filter by owner type |
| `--resourceType` | string |  | Filter by resource type |
| `--resourceId` | string |  | Filter by resource ID |

mapping-rule (mr)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--mappingRuleId` | string |  | Filter by mapping rule ID |
| `--name` | string |  | Filter by name |
| `--claimName` | string |  | Filter by claim name |
| `--claimValue` | string |  | Filter by claim value |

wait-state (ws)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--processInstanceKey` / `-k` | string |  | Filter by process instance key |
| `--rootProcessInstanceKey` / `-r` | string |  | Filter by root process instance key |
| `--elementInstanceKey` / `-e` | string |  | Filter by element instance key |
| `--elementId` | string |  | Filter by element ID (supports wildcards, e.g. `*Task*`) |
| `--elementType` | string |  | Filter by BPMN element type (e.g. SERVICE_TASK, USER_TASK, CALL_ACTIVITY) |
| `--waitStateType` | string |  | Filter by wait state type (JOB, MESSAGE, TIMER, CONDITION, USER_TASK, SIGNAL) |

**Examples:**

```bash
c8ctl search pi --state=ACTIVE                              # Search for active process instances
c8ctl search pd --bpmnProcessId=myProcess                   # Search process definitions by ID
c8ctl search pd --name='*main*'                             # Search process definitions with wildcard
c8ctl search ut --assignee=john                             # Search user tasks assigned to john
c8ctl search inc --state=ACTIVE                             # Search for active incidents
c8ctl search jobs --type=myJobType                          # Search jobs by type
c8ctl search jobs --type='*service*'                        # Search jobs with type containing "service"
c8ctl search variables --name=myVar                         # Search for variables by name
c8ctl search variables --value=foo                          # Search for variables by value
c8ctl search variables --processInstanceKey=123 --fullValue  # Search variables with full values
c8ctl search pd --iname='*order*'                           # Case-insensitive search by name
c8ctl search ut --iassignee=John                            # Case-insensitive search by assignee
c8ctl search ws --waitStateType=JOB                         # Search wait states of type JOB
c8ctl search ws --elementType=SERVICE_TASK                  # Search wait states on service tasks
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
