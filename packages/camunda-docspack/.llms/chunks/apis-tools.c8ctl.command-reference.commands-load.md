# Command reference — Commands — `load`

Load a c8ctl plugin (npm registry or URL)

**Usage:** `c8ctl load plugin [name|--from url]`

**Resources:** plugin

**Positional arguments:**

- **plugin:** `<package>` (optional)

**Flags:**

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--from` | string |  | Load plugin from URL |

**Examples:**

```bash
c8ctl load plugin my-plugin                                 # Load plugin from npm registry
c8ctl load plugin --from https://github.com/org/plugin      # Load plugin from URL
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
