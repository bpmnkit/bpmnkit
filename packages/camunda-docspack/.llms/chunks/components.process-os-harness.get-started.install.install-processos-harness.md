# Install ProcessOS Harness and configure a project — Install ProcessOS Harness

1. Install or update c8ctl, the Camunda 8 CLI:

   ```bash
   npm install -g @camunda8/cli@latest
   ```

1. Load the ProcessOS Harness plugin:

   ```bash
   c8 load plugin @camunda8/c8ctl-plugin-process-os
   ```

1. Create and enter a project folder:

   ```bash
   mkdir -p <my-project> && cd <my-project>
   ```

1. Install ProcessOS Harness Bundle for your AI coding agent. For example, choose `claudecode` for Claude Code or `copilotcli` for GitHub Copilot CLI, as listed in the [ProcessOS Bundle mapping](https://docs.camunda.io/docs/next/components/process-os-harness/get-started/system-requirements#processos-bundle-mapping):

   ```bash
   c8 os install <claudecode>
   ```

   This command downloads the release bundle and extracts it into the current directory.

1. Initialize a version-controlled project:

   ```bash
   git init && git add . && git commit -m "chore(job) commit process-os-harness setup"
   ```

1. Start the journey. Launch your AI coding agent, select a model at least as capable as Opus, then run:

   ```text
   /process-os-governance-start
   ```

### Keep an installation up to date

| Command                          | What it does                  |
| -------------------------------- | ----------------------------- |
| `c8 os update`                   | Update to the latest release. |
| `c8 os install claudecode@1.2.3` | Install a specific version.   |

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/get-started/install
