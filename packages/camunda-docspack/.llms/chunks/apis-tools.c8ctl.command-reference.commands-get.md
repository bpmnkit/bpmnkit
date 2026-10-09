# Command reference — Commands — `get`

Get a resource by key

**Resources:** pi (process-instance), pd (process-definition), inc (incident), topology, form, user, role, group, tenant, auth (authorization), mapping-rule

**Positional arguments:**

- **process-definition:** `<key>` (required)
- **process-instance:** `<key>` (required)
- **incident:** `<key>` (required)
- **user:** `<username>` (required)
- **role:** `<roleId>` (required)
- **group:** `<groupId>` (required)
- **tenant:** `<tenantId>` (required)
- **authorization:** `<authorizationKey>` (required)
- **mapping-rule:** `<mappingRuleId>` (required)
- **form:** `<key>` (required)

**Resource-specific flags:**

process-definition (pd)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--xml` | boolean |  | Get BPMN XML (process definitions) |

form

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--userTask` | boolean |  | Get form for user task |
| `--ut` | boolean |  | Alias for --userTask |
| `--processDefinition` | boolean |  | Get form for process definition |
| `--pd` | boolean |  | Alias for --processDefinition |

process-instance (pi)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--variables` | boolean |  | Include variables in output |

**Examples:**

```bash
c8ctl get pi 123456                                         # Get process instance by key
c8ctl get pi 123456 --variables                             # Get process instance with variables
c8ctl get pd 123456                                         # Get process definition by key
c8ctl get pd 123456 --xml                                   # Get process definition XML
c8ctl get form 123456                                       # Get form (searches both user task and process definition)
c8ctl get form 123456 --ut                                  # Get form for user task only
c8ctl get form 123456 --pd                                  # Get start form for process definition only
c8ctl get user john                                         # Get user by username
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
