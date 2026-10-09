# Clocks — Writing your own

`Clock` is a public interface (`Now`, `Sleep`, `After`); implement it and pass it to
`camunda.WithClock`. `ClockController` is the engine-side half, if you want
`EngineClock` to drive something other than a `CamundaClient`.

Ambient time is banned in the runtime by `.golangci.yml` — `time.Now`, `time.Sleep`,
`time.NewTimer` and friends — so cadence cannot quietly drift back onto real time.

---
Source: https://docs.camunda.io/docs/next/apis-tools/go-sdk/clocks
