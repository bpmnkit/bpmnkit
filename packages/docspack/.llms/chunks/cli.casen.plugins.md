# bpmnkit CLI — Plugins

bpmnkit's plugin system lets you extend the CLI with new command groups — your own organisation's
workflows, third-party integrations, or community-built tools.

### Discover plugins

```sh
# Browse all published bpmnkit plugins
bpmnkit plugin search

# Search by keyword
bpmnkit plugin search deploy
bpmnkit plugin search slack
```

Results are fetched live from the npm registry. Any package tagged with the `casen-plugin` keyword
appears here.

### Install a plugin

```sh
# Install from npm
bpmnkit plugin install casen-deploy

# Install a local plugin during development
bpmnkit plugin install ./my-plugin
```

Plugins are installed into `~/.casen/plugins/` and loaded automatically the next time bpmnkit starts.

### Manage installed plugins

```sh
# List installed plugins
bpmnkit plugin list

# Show full details for one plugin
bpmnkit plugin info casen-deploy

# Update a single plugin to the latest version
bpmnkit plugin update casen-deploy

# Update all installed plugins
bpmnkit plugin update

# Remove a plugin
bpmnkit plugin remove casen-deploy
```

Once installed, plugin commands appear in the main TUI and in tab-completion alongside built-in commands.

To build your own plugin, see [Plugin Authoring](/docs/cli/plugin-authoring).

---
Source: https://bpmnkit.com/docs/cli/casen
