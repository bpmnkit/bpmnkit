# Extend c8ctl with plugins — Manage plugins

### List installed plugins

```bash
c8 list plugins
```

Output shows version and sync status for each plugin:

- `✓ Installed` — plugin is in the registry and installed.
- `⚠ Not installed` — plugin is in the registry but missing from disk (run `sync`).
- `⚠ Not in registry` — plugin is installed but not tracked in the registry.

### Upgrade a plugin

```bash
# Upgrade to latest
c8 upgrade plugin my-custom-plugin

# Upgrade to a specific version
c8 upgrade plugin my-custom-plugin 1.2.3
```

### Downgrade a plugin

```bash
c8 downgrade plugin my-custom-plugin 1.0.0
```

Upgrade and downgrade behavior depends on the plugin source:

| Source      | Behavior                                                                                                    |
| :---------- | :---------------------------------------------------------------------------------------------------------- |
| npm package | Installs `<name>@<version>`.                                                                                |
| URL/git     | Installs `<source>#<version>`.                                                                              |
| `file://`   | Version-based upgrade/downgrade is not supported. Use `load plugin --from` with the desired local checkout. |

### Unload a plugin

```bash
c8 unload plugin my-custom-plugin
```

### Synchronize plugins

Synchronize all plugins from the registry. Rebuilds installed plugins and reinstalls any that are missing:

```bash
c8 sync plugins
```

### Diagnose plugin issues

Use `doctor plugin` to inspect the plugin loading state and surface any command collisions (for example, when two plugins register the same command) or version incompatibilities. The report always exits `0` — it describes state rather than failing.

```bash
# Human-readable summary of loaded plugins, their requirements, and any problems
c8 doctor plugin

# Machine-readable output for scripts and agents
c8 doctor plugin --json
```

Built-in commands always take precedence over plugin commands, and the first plugin to register a given command wins — with one exception: a plugin disabled by its declared `engines.c8ctl` (see below) yields the command name to a compatible plugin regardless of load order, because its own copy could only ever refuse to run. `doctor plugin` shows which registrations were kept and which were shadowed, plus each plugin's declared requirement and whether this c8ctl satisfies it.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins
