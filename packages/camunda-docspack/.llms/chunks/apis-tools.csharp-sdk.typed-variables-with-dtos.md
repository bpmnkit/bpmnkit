# Typed Variables with DTOs

# Typed Variables with DTOs

Camunda API operations use dynamic `variables` and `customHeaders` payloads. By default these are untyped (`object`), but you can opt in to compile-time type safety using your own DTOs.


## Sending Variables (Input)

Assign any DTO or dictionary to the `Variables` property — `System.Text.Json` serializes the runtime type automatically:

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: UsingDirective+SendingVariables+SendingVariablesBody -->

```csharp
using Camunda.Orchestration.Sdk;

// Define your application domain models
public record OrderInput(string OrderId, decimal Amount);

// Assign the DTO directly
await client.CreateProcessInstanceAsync(new ProcessInstanceCreationInstructionById
{
    ProcessDefinitionId = processDefinitionId,
    Variables = new OrderInput("ord-123", 99.99m),
});

// Dictionaries also work — no DTO required
await client.CompleteJobAsync(jobKey, new JobCompletionRequest
{
    Variables = new Dictionary<string, object> { ["processed"] = true },
});
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/typed-variables-with-dtos
