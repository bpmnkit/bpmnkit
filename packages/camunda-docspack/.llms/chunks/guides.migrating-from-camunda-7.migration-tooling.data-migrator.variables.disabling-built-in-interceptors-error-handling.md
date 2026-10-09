# Variables — Disabling built-in interceptors — Error handling

When variable transformation fails:

#### Runtime migration

- The migrator skips the entire process instance.
- Logs detailed error messages with the variable name and cause.
- Marks the instance for potential retry after you fix the underlying issue.

#### History migration

- Skips only the affected variables, decision inputs, or outputs.
- Continues migrating the parent entity.
- Logs skipped items with detailed error information.

#### Example commands

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
