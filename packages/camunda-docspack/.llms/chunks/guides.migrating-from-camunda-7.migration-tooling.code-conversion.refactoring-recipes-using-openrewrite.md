# Code Conversion — Refactoring recipes (using OpenRewrite)

[OpenRewrite](https://docs.openrewrite.org/) is an open-source framework that can automate refactorings by so-called recipes. It is provided with an Apache License, making it easy to adopt in any context.

Use OpenRewrite as an optional recipe-assisted path for repeated, supported, primarily syntactic Java transformations. It creates a deterministic first diff, but it does not complete a migration.

For semantic, cross-cutting, or mixed delegate/client transformations, recipes can be neutral or add rework by constraining downstream AI or manual work.

The Camunda 7 to 8 OpenRewrite recipes help you automatically refactor:

- Client code using the Camunda 7 Java API
- Java delegates and execution listeners (glue code)
- External task workers
- Unit tests (work in progress)

**Note**
The recipes are still under development. Expect recipes to work out-of-the-box only in simple scenarios. For complex codebases, you may need to extend or customize them to suit your needs.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion
