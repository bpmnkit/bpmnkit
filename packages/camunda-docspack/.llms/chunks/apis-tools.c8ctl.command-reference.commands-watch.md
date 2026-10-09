# Command reference — Commands — `watch`

Watch files for changes and auto-deploy

**Usage:** `c8ctl watch [path...]`

**Aliases:** `w`

**Flags:**

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--force` | boolean |  | Continue watching after all deployment errors |
| `--extensions` | string |  | Comma-separated list of additional file extensions to watch (merged with defaults, e.g. .md,.txt) |
| `--all-extensions` | boolean |  | Watch all server-supported file extensions |
| `--process-application` | boolean |  | Watch and deploy the entire process application (requires .process-application marker) |
| `--pa` | boolean |  | Alias for --process-application |

**Examples:**

```bash
c8ctl watch ./src                                           # Watch directory for changes
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
