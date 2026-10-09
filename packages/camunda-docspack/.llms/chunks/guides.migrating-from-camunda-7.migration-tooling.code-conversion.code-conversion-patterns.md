# Code Conversion — Code conversion patterns

Due to the flexibility of Camunda 7, there are many ways to write code and therefore many possible conversion patterns. We maintain a collaborative catalog of these patterns to serve as technical reference material for manual migration and recipe development.

### What are code conversion patterns?

Code conversion patterns are detailed, technical examples showing how specific Camunda 7 code constructs translate to Camunda 8. Each pattern includes:

- Side-by-side code comparisons between Camunda 7 and Camunda 8
- Explanations of conceptual differences
- Parameter mappings and method equivalents
- Notes on edge cases and limitations

### When to use the patterns

Use the code conversion patterns when:

- Starting an AI-first migration: Provide the relevant patterns and source context to the coding model
- Reviewing a recipe-assisted migration: Check that the generated diff implements the relevant patterns
- Manual migration is needed: The recipes cannot handle your specific code structure
- Understanding changes: You want to understand what the recipes are doing under the hood
- Extending recipes: You're developing custom recipes for your organization's specific patterns
- Complex scenarios: Your code uses advanced features that require careful manual conversion

### Pattern categories

The catalog covers the following types of code:

General patterns:

- Maven dependencies and configuration
- Handling process variables

Client code (code that calls the Camunda API):

- Starting process instances
- Correlating messages
- Handling user tasks
- Managing process variables
- Searching process definitions
- Broadcasting signals
- Canceling process instances
- Raising incidents
- Handling resources
- Class-level changes

Glue code (code executed by the process engine):

- Converting JavaDelegates to Job Workers
- Converting ExecutionListeners to Job Workers
- Converting External Task Workers to Job Workers
- Converting expressions

Test code:

- Complete test cases
- Process instance assertions
- Process variable assertions
- User task assertions
- Message correlation
- Job execution

### Accessing the patterns

The complete pattern catalog with code examples is maintained on GitHub.

Browse the complete pattern catalog with code examples in the
[Migration Tooling repository](https://github.com/camunda/camunda-7-to-8-migration-tooling/tree/main/code-conversion/patterns).

**Tip**
The pattern catalog is actively maintained by Camunda consultants, partners, and community members. You can contribute your own patterns or request additions via GitHub issues and pull requests.

### Using patterns with OpenRewrite

The patterns inform the OpenRewrite recipe development. If you find a pattern that's not yet covered by the recipes, you can:

1. Use the pattern for manual migration
2. Reference the pattern when [extending the recipes](https://github.com/camunda/camunda-7-to-8-migration-tooling/blob/main/code-conversion/recipes/developer_guide.md)
3. Contribute a new recipe based on the pattern

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion
