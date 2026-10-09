# Clocks

# Clocks

**Caution: Technical Preview**
The Rust SDK is a **technical preview**. Its API surface may still evolve and changes may not follow semantic versioning. Pin an exact version if you need stability.

Every wait and every elapsed-time measurement in the runtime -- retry backoff, the
backpressure gate, token refresh, job-worker polling, eventual-consistency polling --
resolves through an injected clock rather than ambient time.

| Clock                                 | Use                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------- |
| `LiveClock`                           | real time; the default when nothing is injected                            |
| `#[tokio::test(start_paused = true)]` | tests; tokio virtualises its own timer, so cadence settles without waiting |
| `EngineClock`                         | drives the Camunda engine's clock and the SDK's together                   |

`start_paused` is the lighter-weight option, but it only virtualises _tokio's_ timer -- the
engine carries on in real time. A test whose process only completes once a BPMN timer fires
needs `EngineClock`.

---
Source: https://docs.camunda.io/docs/next/apis-tools/rust-sdk/clocks
