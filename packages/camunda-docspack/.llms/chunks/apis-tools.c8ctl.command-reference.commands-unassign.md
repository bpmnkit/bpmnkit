# Command reference — Commands — `unassign`

Unassign a resource from a target (--from-user, --from-group, etc.)

**Usage:** `c8ctl unassign <resource> <id>`

**Resources:** role, user, group, mapping-rule

**Positional arguments:**

- **role:** `<roleId>` (required)
- **user:** `<username>` (required)
- **group:** `<groupId>` (required)
- **mapping-rule:** `<mappingRuleId>` (required)

**Flags:**

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--from-user` | string |  | Source user ID |
| `--from-group` | string |  | Source group ID |
| `--from-tenant` | string |  | Source tenant ID |
| `--from-mapping-rule` | string |  | Source mapping rule ID |

**Examples:**

```bash
c8ctl unassign role admin --from-user=john                  # Unassign role from user
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
