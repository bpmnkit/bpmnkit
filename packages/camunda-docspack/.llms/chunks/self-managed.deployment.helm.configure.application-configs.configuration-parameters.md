# Configure component configuration — Configuration — Parameters

| Key                                  | Type   | Description                                                                                                                                                                                                                                                                                           |
| ------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<componentName>.extraConfiguration` | list   | **Recommended:** Additional configuration entries layered on top of the default configuration. Each entry has a `file` (filename), `content` (file contents), and optionally `springImport` (boolean, default `true`). See [how it works per component](#how-extraconfiguration-works-per-component). |
| `<componentName>.configuration`      | string | **Advanced:** Full application configuration file content (for example, the full contents of `application.yaml`). Using this **replaces** the component's default application configuration.                                                                                                          |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs
