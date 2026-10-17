# Command reference — Commands — `create`

Create a resource (process instance, identity)

**Resources:** pi (process-instance), user, role, group, tenant, auth (authorization), mapping-rule

**Resource-specific flags:**

process-instance (pi)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--processDefinitionId` | string |  | Process definition ID (BPMN process ID) |
| `--id` | string |  | Process definition ID (alias for --processDefinitionId) |
| `--bpmnProcessId` | string |  | BPMN process ID (alias for --processDefinitionId) |
| `--businessId` | string |  | Business ID for the process instance (Camunda 8.9+) |
| `--variables` | string |  | JSON variables (or @file.json / @- to read from file/stdin) |
| `--awaitCompletion` | boolean |  | Wait for process to complete |
| `--fetchVariables` | boolean |  | Fetch result variables on completion |
| `--requestTimeout` | string |  | Await timeout in milliseconds |

user

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--username` | string |  | Username |
| `--name` | string |  | Display name |
| `--email` | string |  | Email address |
| `--password` | string |  | Password |

role

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--roleId` | string |  | Role ID |
| `--name` | string |  | Display name |

group

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--groupId` | string |  | Group ID |
| `--name` | string |  | Display name |

tenant

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--tenantId` | string |  | Tenant ID |
| `--name` | string |  | Display name |

mapping-rule (mr)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--mappingRuleId` | string |  | Mapping rule ID |
| `--name` | string |  | Display name |
| `--claimName` | string |  | Claim name |
| `--claimValue` | string |  | Claim value |

authorization (auth)

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--ownerId` | string | Yes | Authorization owner ID |
| `--ownerType` | string | Yes | Authorization owner type |
| `--resourceType` | string | Yes | Authorization resource type |
| `--resourceId` | string | Yes | Authorization resource ID |
| `--permissions` | string | Yes | Comma-separated permissions |

**Examples:**

```bash
c8ctl create pi --id=myProcess --businessId=order-123       # Create a process instance with a Business ID
c8ctl create pi --id=myProcess --awaitCompletion            # Create and await completion
c8ctl create user --username=john --name='John Doe' --email=john@example.com --password=secret  # Create a user
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
