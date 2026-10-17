# Extend c8ctl with plugins — Find plugins

Plugins are distributed as regular npm packages. There are two main ways to discover available plugins:

### Search the Camunda GitHub organization

Browse the [Camunda GitHub organization](https://github.com/camunda) and search for repositories with `c8ctl` in the name. By convention, plugin repositories are named `c8ctl-plugin-<name>` (for example, `c8ctl-plugin-analyze`), but this is not a hard requirement — any npm package with a `c8ctl-plugin.js` entry point works as a plugin.

### Search the npm registry

Search for `c8ctl` or `c8ctl-plugin` on [npmjs.com](https://www.npmjs.com/search?q=c8ctl-plugin):

```bash
npm search c8ctl-plugin
```

Once you find a plugin, install it with:

```bash
c8 load plugin <package-name>
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins
