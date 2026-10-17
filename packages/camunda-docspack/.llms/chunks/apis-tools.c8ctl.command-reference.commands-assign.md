# Command reference — Commands — `assign`

Assign a resource to a target (--to-user, --to-group, etc.)

**Usage:** `c8ctl assign <resource> <id>`

**Resources:** role, user, group, mapping-rule

**Positional arguments:**

- **role:** `<roleId>` (required)
- **user:** `<username>` (required)
- **group:** `<groupId>` (required)
- **mapping-rule:** `<mappingRuleId>` (required)

**Flags:**

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--to-user` | string |  | Target user ID |
| `--to-group` | string |  | Target group ID |
| `--to-tenant` | string |  | Target tenant ID |
| `--to-mapping-rule` | string |  | Target mapping rule ID |

**Examples:**

```bash
c8ctl assign role admin --to-user=john                      # Assign role to user
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
