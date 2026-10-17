# c8ctl CLI — Send feedback

```bash
c8 feedback
```

Opens the GitHub issues page in your browser to report bugs or request features.


## Update notifications

`c8ctl` checks for newer versions in the background and displays a one-time notification when an update is available. This check is suppressed in CI environments, JSON output mode, and development versions.


## Shell completion

The recommended way to set up shell completion is with the `install` subcommand:

```bash
c8 completion install
```

This auto-detects your shell, writes the completion file, and wires it into your shell configuration. To specify a shell explicitly:

```bash
c8 completion install --shell zsh
```

Completions auto-refresh when the CLI is upgraded.

Alternatively, generate the completion script manually:

  
### bash

```bash
c8ctl completion bash > ~/.c8ctl-completion.bash
echo 'source ~/.c8ctl-completion.bash' >> ~/.bashrc
source ~/.bashrc
```

### zsh

```bash
c8ctl completion zsh > ~/.c8ctl-completion.zsh
echo 'source ~/.c8ctl-completion.zsh' >> ~/.zshrc
source ~/.zshrc
```

### fish

```bash
c8ctl completion fish > ~/.config/fish/completions/c8ctl.fish
```

Fish loads the completion automatically on the next shell start.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
