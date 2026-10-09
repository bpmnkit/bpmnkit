# Typed Variables with DTOs — Receiving Variables (Output)

Use `DeserializeAs<T>()` to extract typed DTOs from API responses:

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+ReceivingVariables+ReceivingVariablesBody -->

```csharp
using Camunda.Orchestration.Sdk;

public record OrderResult(bool Processed, string InvoiceNumber);

// Deserialize variables from any API response
var result = await client.CreateProcessInstanceAsync(
    new ProcessInstanceCreationInstructionById
    {
        ProcessDefinitionId = processDefinitionId,
    });
var output = result.Variables.DeserializeAs<OrderResult>();
// output.Processed, output.InvoiceNumber — fully typed
```

`DeserializeAs<T>()` handles the common runtime shapes:

- `JsonElement` (standard API response) → deserialized via `System.Text.Json`
- Already the target type → returned as-is (zero-copy)
- `null` → returns `default(T)`

Custom `JsonSerializerOptions` can be passed for non-standard naming conventions.

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/typed-variables-with-dtos
