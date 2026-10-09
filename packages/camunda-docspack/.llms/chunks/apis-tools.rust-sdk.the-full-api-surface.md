# The full API surface

# The full API surface

**Caution: Technical Preview**
The Rust SDK is a **technical preview**. Its API surface may still evolve and changes may not follow semantic versioning. Pin an exact version if you need stability.

The ergonomic facade is **flat and complete**: every REST operation has a method directly
on `CamundaClient` (mirroring the JavaScript, Python, and C# SDKs). Each method builds an
authenticated request, runs under the adaptive backpressure gate and transient-retry
policy, and maps failures to a typed `CamundaError`. Parameter types are re-exported
under `camunda_orchestration_sdk::apis::<area>_api`, so everything imports from one crate:

```rust
// Every REST operation has a flat, ergonomic method on the client. Parameter types
// are imported from `camunda_orchestration_sdk::apis::<area>_api`.
use camunda_orchestration_sdk::apis::process_instance_api::SearchProcessInstancesParams;

let page = client
    .search_process_instances(SearchProcessInstancesParams {
        process_instance_search_query: None,
    })
    .await?;
println!("found {} process instance(s)", page.items.len());
```

A curated set of hot-path operations (`topology`, `create_process_instance`,
`deploy_resources`, job operations, messages, decisions, variables) have hand-written
wrappers with extra ergonomics — semantic key arguments, typed variables, and default
tenant injection. The remaining ~180 methods are **generated** from the operation list by
a post-processing hook, so the facade tracks the upstream spec automatically.

---
Source: https://docs.camunda.io/docs/next/apis-tools/rust-sdk/the-full-api-surface
