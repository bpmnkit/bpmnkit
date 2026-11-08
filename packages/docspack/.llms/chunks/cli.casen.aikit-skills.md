# casen CLI — AIKit Skills

`casen` ships six lightweight, CLI-only Claude Code slash commands (no MCP server, no proxy):

```sh
casen skills install
```

| Command | Description |
|---|---|
| `/implement <description>` | Write a plan, compile it, test it, scaffold workers, deploy |
| `/review <path>` | Run the full lint report and report a deploy-ready verdict |
| `/test <path>` | Run scenario tests and report path/branch coverage |
| `/deploy <path>` | Deploy-readiness gate, then deploy to local Reebe or Camunda 8 |
| `/dmn <description>` | Write a DMN decision table from `casen agent-card dmn` |
| `/form <description>` | Write a Camunda form from `casen agent-card form` |

`casen agent-card bpmn|dmn|form` prints the [agent card](/docs/agent-cards/bpmn) for a file type: a ~1–1.5k-token cheat sheet with a runnable create/export/edit/validate script, the top options and the traps. `--text` on `bpmn` adds the line-format guide `parseProcessText` reads.

For the richer skill set (`/bpmnkit:implement`, `:extend`, `:agent`, `:connect`, plus generated reference docs), install the Claude Code plugin instead: `/plugin marketplace add github:bpmnkit/bpmnkit` then `/plugin install bpmnkit`. See [AIKit Skills](/docs/cli/skills) for full documentation.

---
Source: https://bpmnkit.com/docs/cli/casen
