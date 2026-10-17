# Conceptual differences — Architectural differences — Expression language

Camunda 7 uses [Java Unified Expression Language (JUEL)](https://docs.camunda.org/manual/latest/user-guide/process-engine/expression-language/) as the expression language. In the embedded engine scenario, expressions can even read into beans (Java object instances) in the application.

Camunda 8 uses [Friendly-Enough Expression Language (FEEL)](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel) and expressions can only access the process instance data and variables.

Most expressions can be converted (see [this code in the diagram converter](https://github.com/camunda/camunda-7-to-8-migration-tooling/blob/5e66012c2ef5f301ab6e61b6a3120b13c9c26459/diagram-converter/core/src/main/java/io/camunda/migration/diagram/converter/expression/ExpressionTransformer.java#L21) as a starting point), but you may need to completely rewrite others. Some expressions might even require an additional service task to prepare necessary data that may have been calculated on the fly in Camunda 7.

<!-- TODO extensive docs for the diagram converter -->

You can also use the [FEEL Copilot](https://docs.camunda.io/docs/next/components/early-access/alpha/feel-copilot/feel-copilot) to rewrite complex expressions for you.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences
