# Extend c8ctl with plugins — Help integration

When plugins export a `metadata.commands` object with descriptions, those commands appear in the `c8ctl help` output under a **Plugin Commands** section:

```text
c8ctl - Camunda 8 CLI v2.2.0

Commands:
  list      <resource>       List resources (pi, ut, inc, jobs, profiles)
  get       <resource> <key> Get resource by key (pi, topology)
  ...

Plugin Commands:
  analyze                 Analyze BPMN processes for best practices
  optimize                Optimize process definitions
```

Plugins without a `metadata` export still work — their commands appear in the help output without descriptions.


## Command precedence

Built-in commands take precedence over plugin commands. If a plugin exports a command with the same name as a built-in command (for example, `list` or `deploy`), the built-in command runs.

Use descriptive and unique names for plugin commands.

Recommended:

- `analyze-process`
- `export-data`
- `sync-resources`

Avoid:

- `list`
- `get`
- `create`
- `deploy`

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins
