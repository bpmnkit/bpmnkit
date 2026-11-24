# bpmnkit CLI

`bpmnkit` is an interactive terminal UI (TUI) for managing Camunda 8. Navigate with arrow keys,
no flags to memorize.


## Installation

Since 2.0 `bpmnkit` is a native binary (one bin, `bpmnkit`; the old alias `casen` is gone). Pick one:

```sh
npm install -g @bpmnkit/cli                    # native binary via per-platform packages
npx @bpmnkit/cli --help                        # no install
brew install bpmnkit/tap/bpmnkit-cli          # Homebrew
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/bpmnkit/bpmnkit/releases/latest/download/bpmnkit-cli-installer.sh | sh
```

PowerShell and MSI installers are on the same [GitHub release](https://github.com/bpmnkit/bpmnkit/releases);
`bpmnkit self update` updates installs made with the shell, PowerShell or MSI installers. Commands the binary does not run yet
fall back to [`@bpmnkit/cli-legacy`](/docs/packages/cli-legacy) (set `BPMNKIT_NO_LEGACY=1` to
disable). Scripts that used alias `casen` must call `bpmnkit`.

---
Source: https://bpmnkit.com/docs/cli/casen
