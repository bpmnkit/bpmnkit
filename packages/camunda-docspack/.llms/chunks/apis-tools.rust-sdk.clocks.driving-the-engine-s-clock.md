# Clocks — Driving the engine's clock

`EngineClock` pins the engine's clock instead of passing time locally:

```rust
use camunda_orchestration_sdk::{CamundaClient, CamundaOptions, Clock, EngineClock};
use std::sync::Arc;

// The control client issues the pin requests, and keeps real time itself.
let control = CamundaClient::from_env()?;
let clock: Arc<dyn Clock> = Arc::new(EngineClock::new(Arc::new(control)));

// Anything this client waits on now advances the engine instead of real time.
let client = CamundaClient::new(CamundaOptions::new().with_clock(clock))?;
```

A wait now moves the engine forward and reports the new instant, so the SDK and the engine
agree on what time it is. Overlapping waits settle at a single instant rather than summing:
ten concurrent one-second waits advance the engine by one second, not ten. `pin_to` and
`reset` are available directly for tests that need to move the engine without waiting.

Clock pinning is an alpha engine endpoint, intended for tests rather than production
clusters. Pass the control client the pin requests should travel on -- it keeps real time,
so the requests themselves are unaffected by the pinning.

---
Source: https://docs.camunda.io/docs/next/apis-tools/rust-sdk/clocks
