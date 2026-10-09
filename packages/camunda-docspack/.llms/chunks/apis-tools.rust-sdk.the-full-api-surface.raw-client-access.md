# The full API surface — Raw client access

If you ever need to drop below the facade, build a generated `Configuration` (base URL +
auth applied) and call the generated API directly:

```rust
use camunda_orchestration_sdk::client::apis::authentication_api;
use camunda_orchestration_sdk::CamundaClient;

let client = CamundaClient::from_env()?;
let cfg = client.configuration().await?; // base URL + auth applied
let me = authentication_api::get_authentication(&cfg).await?;
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/rust-sdk/the-full-api-surface
