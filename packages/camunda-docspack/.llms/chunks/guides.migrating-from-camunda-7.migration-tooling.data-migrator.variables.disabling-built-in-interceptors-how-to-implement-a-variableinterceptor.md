# Variables — Disabling built-in interceptors — How to implement a `VariableInterceptor`

1. Create a new Maven project with the provided `pom.xml` structure
2. Add a dependency on `camunda-7-to-8-data-migrator-core` (scope: `provided`)
3. Implement the `VariableInterceptor` interface
4. Add setter methods for any configurable properties
5. Package as JAR and deploy to the `configuration/userlib` folder
6. Configure in `configuration/application.yml`

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
