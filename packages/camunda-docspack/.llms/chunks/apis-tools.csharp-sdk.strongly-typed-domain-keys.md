# Strongly-Typed Domain Keys

# Strongly-Typed Domain Keys

All domain identifiers (process definition keys, job keys, user task keys, etc.) are `readonly record struct` types rather than plain strings. This prevents accidentally mixing different key types at compile time — the same pattern as the JS SDK's branded types.

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+DomainKeys -->

```csharp
using Camunda.Orchestration.Sdk;

// Lift a raw value into the correct nominal type
var defKey = ProcessDefinitionKey.AssumeExists("2251799813686749");

// Type safety — compiler prevents mixing key types
var taskKey = UserTaskKey.AssumeExists("123456");
// await client.GetProcessDefinitionAsync(taskKey); // ← compile error

// Validation — constraints (pattern, length) checked at construction
ProcessDefinitionKey.IsValid("2251799813686749"); // true

// Values returned from API calls are already typed
var result = await client.GetProcessDefinitionAsync(defKey);
// result.ProcessDefinitionKey is ProcessDefinitionKey, not string

// Transparent JSON serialization — no special handling needed
```

Key types implement `ICamundaKey` (string-backed) or `ICamundaLongKey` (long-backed) and serialize as plain JSON values. Constraint validation (regex pattern, min/max length) is enforced in `AssumeExists()` and queryable via `IsValid()`.

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/strongly-typed-domain-keys
