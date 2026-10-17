# Migration journey — Adapt existing code vs refactoring

You need to adjust the code of your solution during migration. There are two general possibilities:

1. Keep existing code written for Camunda 7 and add an **adapter** to run it with Camunda 8. The [Camunda 7 Adapter](https://github.com/camunda-community-hub/camunda-7-to-8-migration/tree/main/camunda-7-adapter) is a starting point for doing this.
2. **Refactor** your code to work with Camunda 8. The [code conversion part of this guide](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion) will focus on this approach.

We generally **recommend refactoring your code.** Let's briefly dive into both options.

**Adapt existing code**

![A diagram showing the adapt existing code approach](../img/adapt-code.png)

While this approach sounds easy at first glance, it typically works only with very cleanly implemented Java Delegates (which could also be simply refactored to Job Workers). Even if using an adapter, you still need to understand architectural implications (such as transactional boundaries) and might need to rewrite some code. It also does not adapt all assets (for example, the Camunda 7 service API or test cases are not adapted).

In general, the adapter approach is rarely used.

**Refactor your code**

![A diagram showing the code refactoring approach](../img/refactor-code.png)

Rewrite your code. This follows typical patterns and might even be automated to some extent using OpenRewrite recipes. See the [code conversion guide](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion) for details.

This approach has the big advantage that the resulting solution will comply with best practices on how Camunda 8 solutions should be written. Furthermore, architectural differences can be better understood while refactoring the solution. Some projects are also happy to clean up a codebase that has grown over time, reducing technical debt as part of the migration effort.

The downside is the effort required to refactor. The best strategy is to not over-engineer the approach for small code bases, but to automate migration of big code bases as much as possible.

**(4)**

The main tasks to migrate your solutions to run on Camunda 8 include:

- Prepare your Camunda 7 solution (optional)
- Convert models
- Convert expressions
- Refactor code
- Improve Camunda 8 Solution (optional)

Let's dive into the details of these tasks.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-journey
