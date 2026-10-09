# Configure component configuration — Configuration — Summary

| Component             | Runtime       | Config format | How `extraConfiguration` is applied                                                                                                                                                                                |
| --------------------- | ------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Identity              | Spring Boot   | YAML          | Individual files mounted, imported via `spring.config.import` (use `springImport: false` to skip import)                                                                                                           |
| Connectors            | Spring Boot   | YAML          | Individual files mounted, imported via `spring.config.import` (use `springImport: false` to skip import)                                                                                                           |
| Orchestration Cluster | Spring Boot   | YAML          | Individual files mounted, imported via `spring.config.import` (use `springImport: false` to skip import)                                                                                                           |
| Web Modeler REST API  | Spring Boot   | YAML          | Individual files mounted, imported via `spring.config.import` (use `springImport: false` to skip import)                                                                                                           |
| Console               | Node.js       | YAML          | Merged at template time into single `application-override.yaml`                                                                                                                                                    |
| Optimize              | Java (custom) | YAML          | Loaded at runtime from `environment-config.yaml` plus any files imported via `spring.config.import` / `spring.config.location` (rendered from `optimize.extraConfiguration`); later imports override earlier ones. |

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/application-configs
