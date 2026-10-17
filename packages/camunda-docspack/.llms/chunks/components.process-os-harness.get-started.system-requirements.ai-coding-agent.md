# System requirements — AI coding agent

ProcessOS Harness drives an AI coding agent to do the work of re-engineering.

| Aspect          | Supported                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| AI coding agent | Claude Code and GitHub Copilot CLI. Other agents may be supported in future releases, but aren't yet tested exhaustively.                     |
| AI platform     | Platforms such as Amazon Bedrock, Azure OpenAI, and Ollama, where the coding agent supports them.                                             |
| Models          | Models natively used by a supported coding agent. Anthropic Claude models are tested the most, with Opus or smarter alternatives recommended. |

The agent needs these permissions in your environment:

- Outbound network access, for example `curl` and `wget`.
- Write access within the ProcessOS Harness project Git repository.
- Permission to execute bash commands and scripts.

AI coding agents are read-only by default and ask for explicit approval otherwise. Teams typically allowlist frequently used safe commands, or enable an accept-edits mode, to reduce the number of prompts during a run.

### ProcessOS Bundle mapping

ProcessOS Harness ships one bundle per AI coding agent. Every bundle carries the same skills, rules, and hooks, generated into the layout that agent expects. Install the bundle that matches your agent, because an agent only discovers skills in its own directory. To understand how bundles are installed, see [Install ProcessOS Harness](https://docs.camunda.io/docs/next/components/process-os-harness/get-started/install#install-processos-harness).

| AI coding agent       | Bundle       | Install command            | Skills directory  |
| --------------------- | ------------ | -------------------------- | ----------------- |
| Claude Code (via CLI) | `claudecode` | `c8 os install claudecode` | `.claude/skills/` |
| Claude Desktop        | `claudecode` | `c8 os install claudecode` | `.claude/skills/` |
| GitHub Copilot CLI    | `copilotcli` | `c8 os install copilotcli` | `.github/skills/` |

Only one bundle can be installed at a time. To move to a different agent, run `c8 os switch <bundle>`, which removes the current bundle before installing the new one.

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/get-started/system-requirements
