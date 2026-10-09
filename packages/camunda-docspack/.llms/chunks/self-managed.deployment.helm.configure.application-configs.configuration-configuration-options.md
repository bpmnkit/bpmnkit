# Configure component configuration — Configuration — Configuration options

Two Helm values are available for component configuration:

- `<componentName>.extraConfiguration`
- `<componentName>.configuration`

**Tip: Which should I use?**

- Use `<componentName>.extraConfiguration`. It keeps the chart-provided defaults intact and lets you add/override only the keys you need.
- Use `<componentName>.configuration` only if you intentionally want to take full control of the application's configuration file. It **overwrites** the default config and can affect startup behavior and upgrades.

#### componentName.extraConfiguration

Use `<componentName>.extraConfiguration` to add or override configuration **without replacing** the component's default configuration. This option accepts an **ordered list** of entries, where each entry specifies a `file` name and its `content`. Entries are processed in order, so **later entries override earlier ones** for duplicate keys — mimicking Spring Boot's `spring.config.import` semantics.

**Info: Recommended default**
Start with `<componentName>.extraConfiguration` whenever possible. It is safer for upgrades because the Helm chart can continue to evolve its defaults while you only maintain the deltas you actually care about.

```yaml
identity:
  extraConfiguration:
    - file: logging-debug.yaml
      content: |
        logging:
          level:
            ROOT: DEBUG
            io.camunda.identity: DEBUG
    - file: logging-production.yaml
      content: |
        logging:
          level:
            ROOT: INFO
            io.camunda.identity: INFO
```

In this example, `logging-production.yaml` is applied after `logging-debug.yaml`, so the final effective log level is `INFO` (last writer wins).

**Note: Why an ordered list?**
Previous versions of the Helm chart used a map (key-value pairs) for `extraConfiguration`. Maps in Go (and Helm) do not guarantee iteration order. Since configuration layering is order-dependent, `extraConfiguration` now uses an array to ensure entries are always applied in the order you define them.

#### componentName.configuration

Use `<componentName>.configuration` to define an application configuration file directly in `values.yaml`.

**Caution: Advanced option (overwrites defaults)**
When you set `<componentName>.configuration`, the Helm chart renders **your content as the entire application configuration file** for that component.

This means:

- You are responsible for including any settings that the chart normally provides by default.
- During upgrades, configuration format or default changes may require you to update your configuration before the component can start.

Prefer `<componentName>.extraConfiguration` unless you specifically need to replace the full file.

For example, `application.yaml`:

```yaml
orchestration:
  configuration: |-
    camunda:
      # Orchestration cluster settings
      database:
      data:
        snapshot-period: "5m"
        primary-storage:
          disk:
            free-space:
              processing: "2GB"
              replication: "1GB"
        secondary-storage:
          autoconfigure-camunda-exporter: true
          type: "elasticsearch"
          elasticsearch:
            url: "http://camunda-elasticsearch:9200"
            cluster-name: "elasticsearch"
            username: ""
            password: "${VALUES_ELASTICSEARCH_PASSWORD:}"
            index-prefix: ""
            number-of-replicas: "1"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs
