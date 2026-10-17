# Troubleshooting — Performance issues

- Adjust `camunda.migrator.page-size`.
- Ensure database resources are sufficient.
- Check network latency between components.
- Monitor CPU/memory/disk usage.


## Variable migration errors

- Check Camunda 8 variable name restrictions.
- Verify variable types are supported.
- Implement a custom `VariableInterceptor` if needed.


## Debug logging

Increase logging levels to get more detail:

```yaml
logging:
  level:
    root: INFO
    io.camunda.migration.data: DEBUG
    io.camunda.migration.data.RuntimeMigrator: TRACE
  file:
    name: logs/camunda-7-to-8-data-migrator.log
```


## Cockpit plugin

### Plugin not visible in Cockpit

- Ensure the plugin JAR is placed in the correct Camunda 7 plugins directory.
- Check Camunda 7 logs for any plugin loading errors.
- Restart Camunda 7 after deploying the plugin.

### No skip data displayed

- Confirm `save-skip-reason: true` is set in the migrator configuration.
- Verify migration has been run with this setting enabled.
- Check database connectivity between the plugin and the migrator database.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/troubleshooting
