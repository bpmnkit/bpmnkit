# Code Conversion — Overview

You must especially rewrite code that does the following:

- Uses the Client API: Starting process instances, correlating messages, managing tasks, etc.
- Implements service tasks, including:
  - [External tasks](https://docs.camunda.org/manual/latest/user-guide/process-engine/external-tasks/#the-external-task-pattern) where workers subscribe to the engine
  - [Java code attached to service tasks](https://docs.camunda.org/manual/latest/user-guide/process-engine/delegation-code/) called directly by the engine (in-VM)

### Tools and resources

This guide covers tools and approaches to help with code conversion:

1. [API Mapping Guide](#api-mapping-guide): Understand how Camunda 7 REST API endpoints map to Camunda 8
2. [Code Conversion Patterns](#code-conversion-patterns): Apply documented patterns in manual or AI-assisted migration
3. [AI-assisted migration](#leverage-ai-for-migration): Use the Camunda migration agent skill for a guided Java migration
4. [OpenRewrite Recipes](#refactoring-recipes-using-openrewrite): Optionally create a deterministic first diff for repeated, supported, primarily syntactic transformations

Additionally, you will find information about:

- [Diagram Converter](#diagram-converter) for BPMN, DMN, and Camunda 7 form conversion
- [Complete migration example](#example-adjust-a-spring-boot-application) showing all tools in action

### Choose your migration approach

Choose a Java migration path after you inventory your codebase. Before you use a path across a broad migration, run both paths on representative Java code and compare the results. Review is mandatory for both paths.

| Approach                                                | Use when                                                                                               | What to expect                                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AI-first, pattern-guided** (preferred starting point) | You have a capable coding model and can review its output.                                             | The agent reads source code and migration patterns directly. Model quality materially affects the output, so review source-to-output mappings and behavior. |
| **Recipe-assisted** (optional)                          | You have repeated, supported, primarily syntactic transformations, or need a deterministic first diff. | Run OpenRewrite, then use AI or manual work to finish the migration. Expect scaffolding, generated names, TODOs, and cleanup.                               |

Neither path guarantees lower token use, cost, or migration time.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion
