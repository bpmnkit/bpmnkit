# Command reference — Commands — `doctor`

Surface plugin-loading collisions detected at startup (#363). Reports loaded plugins with their command names, and any first-registration-wins drops (plugin-name or command-name).

**Resources:** plugin

**Examples:**

```bash
c8ctl doctor plugin                                         # List loaded plugins and any load-time collisions
c8ctl doctor plugin --json                                  # Machine-readable doctor output
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
