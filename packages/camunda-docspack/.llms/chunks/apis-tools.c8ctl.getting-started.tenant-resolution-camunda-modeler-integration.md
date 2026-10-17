# c8ctl CLI — Tenant resolution — Camunda Modeler integration

`c8ctl` automatically reads profiles from Camunda Modeler's `profiles.json` file. These profiles are:

- **Read-only** — cannot be modified or deleted via `c8ctl`.
- **Prefixed** — always displayed with a `modeler:` prefix (for example, `modeler:Local Dev`).
- **Dynamic** — loaded fresh on each command execution.

Platform-specific locations:

| Platform | Path                                                          |
| :------- | :------------------------------------------------------------ |
| Linux    | `~/.config/camunda-modeler/profiles.json`                     |
| macOS    | `~/Library/Application Support/camunda-modeler/profiles.json` |
| Windows  | `%APPDATA%\camunda-modeler\profiles.json`                     |

```bash
# Use a Modeler profile as the active session profile
c8 use profile "modeler:Local Dev"

# Use a Modeler profile for a single command
c8 list pi --profile=modeler:Cloud Cluster
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
