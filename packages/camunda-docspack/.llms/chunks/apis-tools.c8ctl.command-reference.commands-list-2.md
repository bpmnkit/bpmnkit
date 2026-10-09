# Command reference — Commands — `list` (2)

jobs

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--state` | string |  | Filter by state |
| `--type` | string |  | Filter by job type |
| `--processInstanceKey` | string |  | Filter by process instance key |
| `--processDefinitionKey` | string |  | Filter by process definition key |
| `--itype` | string |  | Case-insensitive filter by job type |

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

**Examples:**

```bash
c8ctl list pi                                               # List process instances
c8ctl list pd                                               # List process definitions
c8ctl list users                                            # List users
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
