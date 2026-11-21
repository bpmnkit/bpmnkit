# AIKit Skills

`bpmnkit` ships six lightweight Claude Code slash commands that automate the process
development lifecycle — from natural language description to deployed, running process.
They drive `bpmnkit` directly (no MCP server, no proxy daemon).

For the full skill set — `/bpmnkit:implement`, `:extend`, `:agent`, `:connect`, `:bpmn-script`, `:dmn`, `:form`, plus generated
reference docs the skills read before authoring a plan — install the
[Claude Code plugin](/docs/guides/ai-implement#the-claude-code-plugin) instead.


## Installation

```sh
bpmnkit skills install
```

Copies the skill files into `.claude/commands/` in the current project directory.
Once installed, they appear in Claude Code's slash command picker.

```sh
# Reinstall or overwrite existing skills
bpmnkit skills install --force
```

---

---
Source: https://bpmnkit.com/docs/cli/skills
