# Typed Variables with DTOs — Searching Variables as a DTO

`SearchVariablesAsDtoAsync<T>()` queries a process instance for exactly the variables declared on your DTO, pages through all results, and collapses them into a typed `VariableMap<T>`. Variable names are derived from the same `JsonSerializerOptions` used to deserialize (camelCase by default, overridable with `[JsonPropertyName]`), so the query filter, the raw keys, and DTO binding always agree.

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+SearchVariablesAsDto+SearchVariablesAsDtoBody -->

```csharp
using Camunda.Orchestration.Sdk;

public record OrderVariables(string OrderId, decimal Amount, string? Notes);

// Query only the variables declared on the DTO, across all pages, and
// collapse them into a single typed object.
var map = await client.SearchVariablesAsDtoAsync<OrderVariables>(processInstanceKey);

// Inspect individual values without materializing the whole DTO
if (map.Contains("amount"))
{
    var amount = map.Get<decimal>("amount");
}

// Validate() enforces that every non-nullable DTO member is present,
// throwing VariableValidationException if any required variable is missing.
OrderVariables order = map.Validate();
// order.OrderId, order.Amount — fully typed; order.Notes is optional
```

Behavior notes:

- **Scope collision**: if the same variable name appears at more than one scope (e.g. a local and a parent scope), `SearchVariablesAsDtoAsync` throws `VariableScopeCollisionException` rather than guessing. Narrow the query with the optional `scopeKey` parameter.
- **`Validate()`** throws `VariableValidationException` listing every missing required member; nullable members (`string?`, `int?`) are optional.
- **`Get<TValue>(name)`** and **`Get(name)`** read individual values lazily and return `default`/`null` when absent.

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/typed-variables-with-dtos
