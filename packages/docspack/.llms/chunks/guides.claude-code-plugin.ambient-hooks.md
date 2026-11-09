# Claude Code Plugin — Ambient Hooks

The plugin installs two background hooks:

| Hook | Trigger | What it does |
|---|---|---|
| SessionStart | Every Claude Code session | Checks `casen` is installed |
| PostToolUse | After any Write or Edit | Runs `casen check <file> --deploy` on any `.bpmn` file that was written |

The PostToolUse hook means every `.bpmn` file you (or Claude) writes is automatically
checked by the [deploy gate](/docs/guides/deploy-gate): when Camunda 8 would refuse it, the
gate's lines (`- <id>: <message> (zeebe/<rule>)`) go back to Claude, which fixes them before it
moves on. A file that deploys produces no output.

---

---
Source: https://bpmnkit.com/docs/guides/claude-code-plugin
