# CSAP c8ctl plugin — Prerequisites

Check your build system meets the following requirements:

- [c8ctl](https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started#install) is installed.
- [Node.js](https://nodejs.org/en) 22 or later.
- (Windows) `npm` uses `cmd` as the shell script executor: `npm config set script-shell cmd`.


## Installation

Load the plugin into c8ctl from its Git repository:

```bash
c8ctl load plugin --from https://github.com/camunda/c8ctl-plugin-csap-cli
```

To pin a specific branch or tag, append `#` and the name:

```bash
c8ctl load plugin --from https://github.com/camunda/c8ctl-plugin-csap-cli#v1.2.3
```

To verify the installation, run `c8ctl help`. The `csap-setup` command appears under **Plugin Commands**. To manage the plugin afterward, see [extend c8ctl with plugins](https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins#manage-plugins).

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/csap-cli
