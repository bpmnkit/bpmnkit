# AIKit Skills — `/dmn` and `/form`

Write or edit a DMN decision table or a Camunda form. Each runs `casen agent-card dmn` or
`casen agent-card form` and follows the [agent card](/docs/agent-cards/dmn) it prints: a
runnable build script, the top builder options and the traps (decision and form ids, hit
policy, keeping the layout on edit).

```
/dmn order risk by amount and country
/form review form with a decision and a comment
```

---


## No MCP server required

These skills are plain Bash + Read/Write — they call `casen` directly and never depend on an MCP server or a running proxy. The `@bpmnkit/proxy` MCP server (`bpmn-aikit`) still exists separately, for Claude Desktop/Cursor or other MCP-only hosts — it's unrelated to these slash commands.

---
Source: https://bpmnkit.com/docs/cli/skills
