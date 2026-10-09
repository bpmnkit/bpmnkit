# Variables — Disabling built-in interceptors — Execution order

- Custom interceptors configured in the `application.yml` are executed in their order of appearance from top to bottom
  - Built-in interceptors run first, followed by custom interceptors
- In a Spring Boot environment, you can register interceptors as beans and change their execution order with the `@Order` annotation (lower values run first)

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
