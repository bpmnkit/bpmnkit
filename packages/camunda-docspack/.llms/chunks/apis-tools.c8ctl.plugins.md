# Extend c8ctl with plugins

Scaffold, install, and manage c8ctl plugins to add custom commands to the Camunda 8 CLI.

<!-- This page is maintained in the c8ctl repository (https://github.com/camunda/c8ctl, in docs/) and
     is synced to camunda-docs automatically. Do not edit it in camunda-docs — changes will be
     overwritten. Edit the source in the c8ctl repo instead. -->

`c8ctl` supports a global plugin system that lets you add custom commands. Plugins are installed globally to a user-specific directory and tracked in a registry file (`plugins.json`).


## Plugin storage locations

| Platform | Plugins directory                                          | Registry file                                      |
| :------- | :--------------------------------------------------------- | :------------------------------------------------- |
| Linux    | `~/.config/c8ctl/plugins/node_modules`                     | `~/.config/c8ctl/plugins.json`                     |
| macOS    | `~/Library/Application Support/c8ctl/plugins/node_modules` | `~/Library/Application Support/c8ctl/plugins.json` |
| Windows  | `%APPDATA%\c8ctl\plugins\node_modules`                     | `%APPDATA%\c8ctl\plugins.json`                     |

You can override the data directory with the `C8CTL_DATA_DIR` environment variable.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins
