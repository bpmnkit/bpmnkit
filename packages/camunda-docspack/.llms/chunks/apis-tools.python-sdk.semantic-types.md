# Semantic Types

# Semantic Types

The SDK uses distinct types for identifiers like `ProcessDefinitionKey`, `ProcessInstanceKey`, `JobKey`, `TenantId`, etc., defined in `camunda_orchestration_sdk.semantic_types` and re-exported from the top-level package. These types inherit from `str`, so they serialize transparently to/from JSON and are compatible with any code expecting a string.


## Why they exist

Camunda's API has many operations that accept string keys — process definition keys, process instance keys, incident keys, job keys, and so on. Without semantic types, it is easy to accidentally pass a process instance key where a process definition key is expected, or mix up a job key with an incident key. The type checker cannot help you if everything is `str`.

Semantic types make these identifiers **distinct at the type level**. Pyright (and other type checkers) will flag an error if you pass a `ProcessInstanceKey` where a `ProcessDefinitionKey` is expected, catching bugs before runtime.

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/semantic-types
