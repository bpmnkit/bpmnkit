# Semantic Types

# Semantic Types

**Caution: Technical Preview**
The PHP SDK is a **technical preview**. Its API surface may still evolve and changes may not follow semantic versioning. Pin an exact version if you need stability.

The SDK uses distinct value objects for identifiers like `ProcessDefinitionId`, `ProcessInstanceKey`, `JobKey`, `TenantId`, and so on, defined in the `Camunda\Orchestration\Semantic` namespace.


## Why they exist

Camunda's API has many operations that accept string keys. Without semantic types it is easy to accidentally pass a process-instance key where a process-definition id is expected. When everything is a `string`, static analysis cannot help you.

Semantic types make these identifiers **distinct at the type level**. PHPStan flags an error if you pass the wrong identifier type, catching bugs before runtime. Each value object validates its format on construction and implements `Stringable` and `JsonSerializable`, so it serializes transparently to and from JSON.

---
Source: https://docs.camunda.io/docs/next/apis-tools/php-sdk/semantic-types
