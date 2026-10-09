# Command reference — Commands — `delete`

Delete a resource by key

**Usage:** `c8ctl delete <resource> <key>`

**Resources:** user, role, group, tenant, auth (authorization), mapping-rule

**Positional arguments:**

- **user:** `<username>` (required)
- **role:** `<roleId>` (required)
- **group:** `<groupId>` (required)
- **tenant:** `<tenantId>` (required)
- **authorization:** `<authorizationKey>` (required)
- **mapping-rule:** `<mappingRuleId>` (required)

**Examples:**

```bash
c8ctl delete user john                                      # Delete user
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
