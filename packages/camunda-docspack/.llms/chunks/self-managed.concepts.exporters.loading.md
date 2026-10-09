# Camunda exporters — Loading

Exporters are loaded during broker startup, before any processing begins.

The broker validates each exporter configuration during loading and will fail to start if:

- An exporter ID is not unique
- The exporter references a non-existent or inaccessible JAR
- The specified class does not exist or can't be instantiated
- The exporter throws an exception in its `Exporter#configure` method

This validation step allows exporters to perform lightweight configuration checks. During this phase, the context provides a partition ID value of `Context#NULL_PARTITION_VALUE`. At runtime, this will be replaced with the actual partition ID.

**Note**
Zeebe instantiates the exporter for validation and then discards it. Exporters should avoid heavy computations during instantiation.

### Metrics

The Micrometer [MeterRegistry](https://docs.micrometer.io/micrometer/reference/concepts/registry.html) is available via the `Exporter#configure(Context)` method for exporters to record metrics:

```java
public class SomeExporter implements Exporter {
    @Override
    public void configure(final Context context) {
        // ...
        registry = context.getMeterRegistry();
        // ...
    }

    public void flush() {
        try (final var ignored = Timer.resource(registry, "meter.name")) {
            exportBulk();
        }
    }
}
```

When an exporter is validated, it receives an in-memory register that is discarded afterward.

**Note**
Zeebe creates an isolated class loader for each JAR referenced in exporter configurations. If the same JAR is used by multiple exporters, they will share the same class loader.

This design allows different exporters to depend on the same third-party libraries without concerns about version conflicts or class name collisions.

System classes and those bundled with the Zeebe JAR are loaded via the system class loader.

Exporter-specific configuration is defined in the `[exporters.args]` nested map. This map is passed as a `Map<String, Object>` to the exporter's `Exporter#configure(Configuration)` method using the [Configuration](https://github.com/camunda/camunda/tree/main/zeebe/exporter-api/src/main/java/io/camunda/zeebe/exporter/api/context/Configuration.java) object.

Configuration takes place in two phases: once during broker startup and again each time a partition elects a new leader.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/exporters
