# Configure component configuration — Configuration — How extraConfiguration works per component

Camunda components use different runtimes and configuration mechanisms. The Helm chart handles `extraConfiguration` differently for each, so the user-facing `values.yaml` API remains consistent while the underlying behavior adapts to what each application actually supports.

#### Spring Boot components

**Applies to:** Identity, Connectors, Orchestration, Web Modeler REST API

Spring Boot components support loading multiple configuration files via `spring.config.import`. Each `extraConfiguration` entry is mounted as an **individual file** in the container's config directory and imported by Spring at startup. Order is preserved by the array in the values.yaml. Spring applies files in import order, with later files overriding earlier ones.

```yaml
identity:
  extraConfiguration:
    - file: custom-logging.yaml
      content: |
        logging:
          level:
            ROOT: DEBUG
    - file: custom-cache.yaml
      content: |
        spring:
          cache:
            type: caffeine
```

Both files are mounted and imported separately. No merging happens at Helm template time.

##### Excluding files from `spring.config.import`

By default, every `extraConfiguration` entry is added to Spring Boot's `spring.config.import` property. This works for Spring-compatible files (YAML, properties) but causes Spring Boot to fail on startup when non-Spring files (such as Log4j2 XML configs) are provided.

To mount a file into the container **without** adding it to `spring.config.import`, set `springImport: false` on the entry:

```yaml
connectors:
  extraConfiguration:
    - file: log4j2.xml
      springImport: false
      content: |-
        <?xml version="1.0" encoding="UTF-8"?>
        <Configuration status="WARN" monitorInterval="30">
          ...
        </Configuration>
    - file: custom-application.yaml
      content: |
        my.custom.property: value
```

In this example, `log4j2.xml` is mounted in the config directory but not imported by Spring. `custom-application.yaml` is both mounted and imported (the default behavior when `springImport` is omitted or set to `true`).

#### Node.js Components

**Applies to:** Console

Console is a Node.js application that reads only two configuration files: `application.yaml` (the main config) and `application-override.yaml` (a single override file). It does not support loading multiple override files.

Because of this constraint, the Helm chart **merges all `extraConfiguration` entries at template rendering time** into a single `application-override.yaml` using deep merge. Later entries override earlier ones for duplicate keys.

```yaml
console:
  extraConfiguration:
    - file: feature-flags.yaml
      content: |
        camunda:
          console:
            features:
              newDashboard: true
    - file: logging.yaml
      content: |
        camunda:
          console:
            logging:
              level: INFO
```

The Helm chart merges both entries and renders a single `application-override.yaml` in the ConfigMap:

```yaml
# Rendered application-override.yaml
camunda:
  console:
    features:
      newDashboard: true
    logging:
      level: INFO
```

#### Custom configuration loading

**Applies to:** Optimize

Optimize uses its own configuration loader (not standard Spring Boot conventions). It reads only two files: `environment-config.yaml` (main config) and `application-ccsm.yaml` (Identity/auth config, loaded when the `ccsm` Spring profile is active). It does **not** scan its config directory for additional files.

Starting with **Camunda 8.9**, Optimize also loads any additional configuration files that are referenced via Spring's `spring.config.import` or `spring.config.location` properties. This allows you to use `optimize.extraConfiguration` to configure Optimize-native settings in addition to Spring-only settings.

In the Helm chart, each `optimize.extraConfiguration` entry is rendered as a separate file in the Optimize config directory. Spring imports these files in the order you define them, and Optimize's configuration loader applies them in the **same order**. For duplicate keys, later entries override earlier ones.

```yaml
optimize:
  extraConfiguration:
    - file: custom-zeebe.yaml
      content: |
        zeebe:
          partitionCount: 6
    - file: custom-es.yaml
      content: |
        es:
          connection:
            nodes:
              - host: "custom-es-host"
                httpPort: 9200
```

Both files remain separate in the Optimize config directory and are loaded at runtime in the order you define.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs
