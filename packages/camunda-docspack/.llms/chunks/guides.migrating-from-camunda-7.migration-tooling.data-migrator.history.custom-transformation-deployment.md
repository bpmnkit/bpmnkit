# History — Custom transformation — Deployment

1. Package your custom interceptor as a JAR file
2. Place the JAR in the `configuration/userlib/` folder
3. Configure the interceptor in `configuration/application.yml`
4. Restart the Data Migrator

The `enabled` property is supported for all interceptors (both built-in and custom) and defaults to `true`.

See [example interceptor](https://github.com/camunda/camunda-7-to-8-migration-tooling/tree/main/data-migrator/examples/entity-interceptor).

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
