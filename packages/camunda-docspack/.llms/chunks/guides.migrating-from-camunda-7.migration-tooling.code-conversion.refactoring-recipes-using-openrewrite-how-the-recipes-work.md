# Code Conversion — Refactoring recipes (using OpenRewrite) — How the recipes work

When you select the recipe-assisted path, the code transformation is performed in three phases:

1. **Prepare**: Prepares the Camunda 7 code with minimal changes (e.g., converting TypedValue API to Java Object API, adding Maven dependencies).
2. **Migrate**: Replaces Camunda 7 methods with Camunda 8 equivalents. Comments are added where parameters were modified or removed.
3. **Cleanup**: Removes unnecessary dependencies and imports.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion
