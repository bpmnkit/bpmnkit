# Command reference — Commands — `run`

Deploy and start a process instance from a BPMN file

**Usage:** `c8ctl run <path>`

**Flags:**

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--businessId` | string |  | Business ID for the process instance (Camunda 8.9+) |
| `--variables` | string |  | JSON variables (or @file.json / @- to read from file/stdin) |
| `--force` | boolean |  | Deploy any file type, ignoring the default extension allow-list |

**Examples:**

```bash
c8ctl run ./my-process.bpmn --businessId=order-123          # Deploy and start a process with a Business ID
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
