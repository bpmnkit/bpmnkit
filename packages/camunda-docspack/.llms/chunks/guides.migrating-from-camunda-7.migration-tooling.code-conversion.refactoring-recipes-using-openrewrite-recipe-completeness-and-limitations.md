# Code Conversion — Refactoring recipes (using OpenRewrite) — Recipe completeness and limitations

The recipes cover:

- Class structure and annotations
- Dependencies and imports
- Basic types and commonly used methods

However, they are incomplete in two aspects:

- Some Camunda 7 methods could be transformed but are not yet included
- Some Camunda 7 methods have no equivalent in Camunda 8

Recipes do not resolve migration design decisions such as business behavior, eventual consistency, transaction boundaries, or architectural separation.

If Camunda 7 code remains after applying recipes:

1. Refer to the [code conversion patterns](#code-conversion-patterns) for manual migration guidance
2. Extend the recipes for your specific use case (see the [developer guide](https://github.com/camunda/camunda-7-to-8-migration-tooling/blob/main/code-conversion/recipes/developer_guide.md))
3. Remove or refactor the code if the functionality is no longer available

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion
