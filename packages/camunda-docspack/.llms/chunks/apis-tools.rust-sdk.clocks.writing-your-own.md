# Clocks — Writing your own

`Clock` is a public trait (`now`, `now_wall`, `sleep`); implement it and pass it to
`CamundaOptions::with_clock`. `ClockController` is the engine-side half, if you want
`EngineClock` to drive something other than a `CamundaClient`.

Ambient time is banned in the runtime by `clippy.toml` -- `Instant::now`, `SystemTime::now`,
`tokio::time::sleep` and friends -- so cadence cannot quietly drift back onto real time.

---
Source: https://docs.camunda.io/docs/next/apis-tools/rust-sdk/clocks
