# Code Conversion — Refactoring recipes (using OpenRewrite) — Available recipes

The recipes are organized by code type and transformation phase:

| Type of change | Client code             | Java delegate             | External worker                 |
| -------------- | ----------------------- | ------------------------- | ------------------------------- |
| **Prepare**    | AllClientPrepareRecipes | AllDelegatePrepareRecipes | AllExternalWorkerPrepareRecipes |
| **Migrate**    | AllClientMigrateRecipes | AllDelegateMigrateRecipes | AllExternalWorkerMigrateRecipes |
| **Cleanup**    | AllClientCleanupRecipes | AllDelegateCleanupRecipes | AllExternalWorkerCleanupRecipes |
| **Combined**   | AllClientRecipes        | AllDelegateRecipes        | AllExternalWorkerRecipes        |

You can apply recipes individually by phase, or use the _combined_ recipes to run all three phases at once.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion
