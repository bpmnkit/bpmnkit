# Command reference — Commands — `use`

Set active profile or tenant

**Usage:** `c8ctl use profile|tenant`

**Resources:** profile, tenant

**Positional arguments:**

- **profile:** `<name>` (optional)
- **tenant:** `<tenantId>` (required)

**Flags:**

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--none` | boolean |  | Clear active profile/tenant |

**Examples:**

```bash
c8ctl use profile prod                                      # Set active profile
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
