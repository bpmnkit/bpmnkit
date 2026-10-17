# Extend c8ctl with plugins — Scaffold a new plugin

Generate a new plugin project from a TypeScript template:

```bash
c8ctl init plugin my-plugin
```

This creates a project directory with all necessary files, build configuration, and an `AGENTS.md` guide for autonomous plugin implementation.


## Install a plugin

### From the npm registry

```bash
c8 load plugin my-custom-plugin
```

### From a URL

```bash
c8 load plugin --from https://github.com/user/my-plugin
c8 load plugin --from file:///path/to/local/plugin
c8 load plugin --from git://github.com/user/plugin.git
```

After loading, plugin commands are immediately available.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins
