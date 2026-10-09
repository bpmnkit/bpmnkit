# Command reference — Commands — `set`

Set variables on an element instance (process instance or flow element scope). Variables are propagated to the outermost scope by default; use --local to restrict to the specified scope.

**Usage:** `c8ctl set variable <key>`

**Resources:** variable

**Positional arguments:**

- **variable:** `<key>` (required)

**Flags:**

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--variables` | string | Yes | JSON object of variables to set, or @file.json / @- to read from file/stdin (required) |
| `--local` | boolean |  | Set variables in local scope only (default: propagate to outermost scope) |

**Examples:**

```bash
c8ctl set variable 2251799813685249 --variables='{"status":"approved"}'  # Set variables on a process instance
c8ctl set variable 2251799813685249 --variables='{"x":1}' --local  # Set variables in local scope only
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
