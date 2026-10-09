# Development workflows — AI agents and scripting

c8ctl includes flags and output modes designed for AI agents and scripts. These also appear in their own labeled section in `c8ctl help`.

### Filter output with `--fields`

`--fields` limits output to the named fields (comma-separated). It applies to all `list`, `search`, and `get` commands, and matching is case-insensitive. This is useful for reducing the amount of output passed into an agent's context window.

```bash
# Only return the Key and State columns
c8 list pi --fields Key,State
c8 search pd --fields Key,processDefinitionId,name

# Works in both text and JSON output modes
c8 output json
c8 list pi --fields Key,State,processDefinitionId | jq .
```

### Preview requests with `--dry-run`

`--dry-run` prints the API request that would be sent without executing it. It works on every command — queries (`list`, `search`, `get`) and mutations (`create`, `cancel`, `deploy`, `complete`, `fail`, `activate`, `resolve`, `publish`, `correlate`). The command prints a JSON object to stdout and exits `0`:

```json
{
  "dryRun": true,
  "command": "create process-instance",
  "method": "POST",
  "url": "http://localhost:8080/v2/process-instances",
  "body": { "processDefinitionId": "my-process", "tenantId": "<default>" }
}
```

**Tip: Recommended workflow for mutations**

1. Run the command with `--dry-run` and show the would-be API call.
2. Wait for confirmation.
3. Re-run without `--dry-run` to execute.

```bash
# Preview creating a process instance
c8 create pi --id=my-process --dry-run

# Preview a deployment
c8 deploy ./my-process.bpmn --dry-run

# Preview cancelling a process instance
c8 cancel pi 2251799813685249 --dry-run

# Inspect the filter body a search would send
c8 search pi --state ACTIVE --between 2024-01-01..2024-12-31 --dry-run
```

### Machine-readable help

In JSON output mode, `c8ctl help` emits structured JSON describing the full command tree, flags (with types), and agent flags:

```bash
c8 output json
c8 help          # JSON with commands[], globalFlags[], agentFlags[], and resourceAliases
c8 help list     # JSON for a specific command
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/development-workflows
