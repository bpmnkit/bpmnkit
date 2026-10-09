# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Deprecated application configuration Helm keys

Chart 15.x (8.10) deprecates Helm keys that acted as thin proxies for a single application setting, in favor of the component's `extraConfiguration`. These keys continue to work in 8.10, except the keys that the tables say have no effect.

If you set one of these keys to a non-default value, the chart prints a `[camunda][warning] DEPRECATION` message in the `helm install` or `helm upgrade` output. If `global.createReleaseInfo` is `false`, the chart doesn't print the message in that output. The message also appears in the `<RELEASE>-warnings` ConfigMap.

The message says that chart v16 (Camunda 8.11) removes the key. If you migrate the keys while you're on 8.10, your values file stays ready for that removal.

**Note: Deprecations are still being added**
Camunda 8.10 is under active development. Camunda may deprecate more keys during the 8.10 release cycle. The tables below cover the keys that Camunda deprecated at the time of writing. Treat the `[camunda][warning] DEPRECATION` messages that your own `helm upgrade` emits as the authoritative, up-to-date list for your chart version. Each message names the deprecated key and where to configure it instead.

With `extraConfiguration`, each component can own the native configuration file of its application. The format is the same as in 8.9. It's an ordered list of file entries. For Spring Boot components, the chart mounts the files and imports them through `spring.config.import`.

To learn how `extraConfiguration` works in each component, see [Application configuration and `extraConfiguration`](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs#how-extraconfiguration-works-per-component). The same page explains how to exclude non-Spring files with `springImport: false`.

To find the property that the chart generates for a key, render the configuration of the component. For example, render it with `helm template <RELEASE> camunda/camunda-platform --version <CHART_VERSION> -f values-8.10.yaml --show-only templates/orchestration/configmap.yaml`. Then find the equivalent property in the rendered configuration.

For the deprecated keys below, the value in your `extraConfiguration` overrides the value that the chart renders. This happens because Spring Boot applies imported files after the chart's `application.yaml`. You don't need to remove the deprecated key at the same time. When you migrate, note these points:

- For `orchestration.exporters.camunda.enabled`, the document store, and the keys of Optimize and Camunda Hub, the chart also reads your `extraConfiguration` itself. For most of these keys, the chart recognizes only nested YAML keys in the first document of a file that Spring imports. The chart doesn't recognize flat dotted keys such as `camunda.data.snapshot-period`. Therefore, write migrated properties as nested YAML.
- The chart doesn't process `extraConfiguration` content as a template. Write final values instead of expressions such as `{{ .Release.Name }}`.
- If you set `orchestration.configuration`, this setting replaces the generated `application.yaml`, including its `spring.config.import` list. As a result, the chart doesn't import your `extraConfiguration` files, unless your file imports them.
- Some chart defaults differ from the application defaults. For example, `orchestration.cpuThreadCount` and `orchestration.ioThreadCount` have the chart default `3` and the application default `2`. The key `orchestration.history.rolloverBatchSize` has the chart default `100` and the application default `500`. The chart still renders its defaults in 8.10. To keep a chart default after the chart removes the key, set that value explicitly when you migrate.

Move each deprecated key to the `extraConfiguration` of the listed component, except where the notes say otherwise.

#### Orchestration

Move these keys to `orchestration.extraConfiguration`. If the notes say that a key has no effect, remove the key instead.

From `orchestration.history.retention.enabled`, the chart also renders `camunda.operate.archiver.ilmEnabled` and `camunda.tasklist.archiver.ilmEnabled`. The 8.10 application doesn't read these properties, so you don't need to migrate them.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
