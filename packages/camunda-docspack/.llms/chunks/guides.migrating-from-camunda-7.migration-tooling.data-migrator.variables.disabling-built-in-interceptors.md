# Variables — Disabling built-in interceptors

You can disable any built-in transformer or validator using the `enabled` configuration property:

```yaml
camunda:
  migrator:
    # Variable interceptor plugins configuration
    interceptors:
      # Disable date transformation
      - class-name: io.camunda.migration.data.impl.interceptor.DateVariableTransformer
        enabled: false
```

You can find a complete list of built-in interceptors in the [property reference](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/config-properties#built-in-interceptors).


## Custom transformation

The `VariableInterceptor` interface allows you to define custom logic that executes whenever a variable is accessed or modified during migration. This is useful for auditing, transforming, or validating variable values.

Custom interceptors are enabled by default and can be restricted to specific variable types.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
