# Troubleshooting

Common issues and solutions when running the Data Migrator.

Troubleshooting information for common issues when running the Data Migrator.


## Migration fails to start

- Verify Java 21+: `java -version`.
- Check database connectivity and credentials.
- Ensure Camunda 8 is running and accessible.
- Review your `configuration/application.yml` configuration.
- Check that JDBC driver jar is added to the `configuration/userlib/` directory.


## Process instances are skipped

- Ensure Camunda 8 process definitions are deployed.
- Verify `migrator` execution listeners are added to None Start Events.
- Ensure flow nodes exist in both Camunda 7 and Camunda 8 models.
- Review skipped instance logs for exact reasons.

List and retry skipped instances:

### maclinux

```bash
./start.sh --runtime --list-skipped
./start.sh --runtime --retry-skipped
```

### windows

```bash
start.bat --runtime --list-skipped
start.bat --runtime --retry-skipped
```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/troubleshooting
