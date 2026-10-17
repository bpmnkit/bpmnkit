# Command reference — Commands — `completion`

Generate shell completion script

**Usage:** `c8ctl completion bash|zsh|fish|install`

**Resources:** bash, zsh, fish, install

**Resource-specific flags:**

install

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--shell` | string |  | Shell to install completions for (bash, zsh, fish) |

**Examples:**

```bash
c8ctl completion bash                                       # Generate bash completion script
c8ctl completion install                                    # Auto-detect shell and install completions (auto-refreshes on upgrade)
c8ctl completion install --shell zsh                        # Install completions for a specific shell
```

---

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/command-reference
