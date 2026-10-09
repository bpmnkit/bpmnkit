# Command reference — Commands — `deploy`

Deploy files to Camunda (auto-discovers deployable files in directories). When deploying a directory that is inside a process application (a parent directory contains a .process-application marker), the entire application root is deployed. Explicit file paths are not expanded.

**Usage:** `c8ctl deploy [path...]`

**Flags:**

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--force` | boolean |  | Deploy any file type, ignoring the default extension allow-list |
| `--extensions` | string |  | Comma-separated list of additional file extensions to include when scanning directories (e.g. .md,.txt). Explicit file paths bypass the extension allow-list. |
| `--all-extensions` | boolean |  | Include all server-supported file extensions during directory discovery |

**Examples:**

```bash
c8ctl deploy ./my-process.bpmn                              # Deploy a BPMN file
c8ctl deploy                                                # Deploy from current directory (detects process application root)
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
