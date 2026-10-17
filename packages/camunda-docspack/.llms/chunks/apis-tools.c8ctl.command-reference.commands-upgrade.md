# Command reference — Commands — `upgrade`

Upgrade a plugin (respects source type)

**Usage:** `c8ctl upgrade plugin <name> [version]`

**Resources:** plugin

**Positional arguments:**

- **plugin:** `<package>` (required), `<version>` (optional)

**Examples:**

```bash
c8ctl upgrade plugin my-plugin                              # Upgrade plugin to latest version
c8ctl upgrade plugin my-plugin 1.2.3                        # Upgrade plugin to a specific version (source-aware)
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
