# Resilience — Global Backpressure (Adaptive Concurrency) — Inspecting State Programmatically

<!-- snippet-source: docs/examples/ReadmeExamples.cs | regions: BackpressureState -->

```csharp
var state = client.GetBackpressureState();
// state.Severity: "healthy", "soft", or "severe"
// state.Consecutive: consecutive backpressure signals observed
// state.PermitsMax: current concurrency cap (null when LEGACY / not engaged)
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/csharp-sdk/resilience
