# Migration tools — Agentic migration — other-agents

Use GitHub CLI 2.90 or later to install the skill:

```bash
gh skill install camunda/camunda-7-to-8-migration-tooling migrate-c7-to-c8-code --agent <tool-name>
```

Replace `<tool-name>` with the name of your agent. See the [agent-specific installation commands](https://github.com/camunda/camunda-7-to-8-migration-tooling/blob/main/agentic-migration-skills/README.md#install-commands-for-other-agents) for supported values. For manual installation paths, see the [Agentic Migration Skills README](https://github.com/camunda/camunda-7-to-8-migration-tooling/blob/main/agentic-migration-skills/README.md#manual-installation).

Then run the `migrate-c7-to-c8-code` skill from your project directory using your agent's command.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/index
