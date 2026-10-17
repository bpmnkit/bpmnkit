# Migration tools — Agentic migration — Select a Java migration path

After the inventory, select the path that fits your codebase and review capacity:

| Path                                                    | Use when                                                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **AI-first, pattern-guided** (preferred starting point) | You have a capable coding model and can review source-to-output mappings and behavior.                 |
| **Recipe-assisted** (optional)                          | You have repeated, supported, primarily syntactic transformations, or need a deterministic first diff. |

Run both paths on representative Java code before you use one across a broad migration. A recipe-assisted path can add scaffolding, generated names, TODOs, and cleanup. Neither path guarantees lower token use, cost, or migration time. See [Code Conversion](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion#choose-your-migration-approach) for detailed selection guidance.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/index
