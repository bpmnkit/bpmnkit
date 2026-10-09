# Filters — Troubleshooting

The gateway won't start with a misconfigured filter. The following errors identify what went wrong and how to fix it.

**Note**
Environment variables can overwrite your gateway configuration file. The gateway logs the configuration it uses during startup, use this to verify your configuration.

### `java.lang.ClassNotFoundException`

**Observed behavior:** The gateway fails to start and logs `java.lang.ClassNotFoundException` for your filter class.

**Why this happens:** Your `Filter` implementation couldn't be found on the classpath.

**How to fix:** Confirm the `className` is configured correctly in the [gateway configuration](#loading-a-filter-into-a-gateway), and that your [JAR contains your class](#packaging-a-filter).

### `io.camunda.zeebe.gateway.rest.impl.filters.FilterLoadException`

**Observed behavior:** The gateway fails to start and logs `FilterLoadException`.

**Why this happens:** Something went wrong loading your filter. The exception message describes the specific cause, but the two common ones are:

- **Unable to instantiate your class**: your class doesn't meet the [filter requirements](#implementing-a-filter).
- **The JAR could not be loaded**: the filter isn't configured correctly in the [gateway configuration](#loading-a-filter-into-a-gateway), or the [JAR isn't packaged correctly](#packaging-a-filter) (for example, missing runtime dependencies in the manifest's classpath).

**How to fix:** Match the specific cause in the exception message to the list above, then apply the corresponding fix.

### `io.camunda.zeebe.util.jar.ExternalJarLoadException`

**Observed behavior:** The gateway fails to start and logs `ExternalJarLoadException`.

**Why this happens:** The JAR itself couldn't be loaded.

**How to fix:** Confirm your filter is configured correctly in the [gateway configuration](#loading-a-filter-into-a-gateway).

### `java.lang.UnsupportedClassVersionError`

**Observed behavior:** The gateway fails to start and logs `UnsupportedClassVersionError`.

**Why this happens:** Your filter was compiled with a more recent Java Runtime version than the gateway supports.

**How to fix:** Recompile your [class](#packaging-a-filter) with JDK 21.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/zeebe-gateway/filters
