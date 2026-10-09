# Clocks

# Clocks

**Caution: Technical Preview**
The Go SDK is a **technical preview**. Its API surface may still evolve and changes may not follow semantic versioning. Pin an exact version if you need stability.

Retry backoff, the backpressure gate, token refresh, job-worker polling and
consistency polling all resolve through an injected clock rather than the `time`
package, so a test can control cadence instead of waiting for it.

Two places deliberately stay on real time, each marked with a `//nolint:forbidigo`
naming the reason: `LiveClock` itself, which is the adapter onto the `time` package,
and `internal/falcon`, whose timers are mostly I/O bounds — read-idle detection and
create-ack budgets — that would misfire if bound to engine time.

| Clock            | Use                                                                       |
| ---------------- | ------------------------------------------------------------------------- |
| `LiveClock`      | real time; the default when nothing is injected                           |
| your own `Clock` | tests; return whatever `Now` you like and make `Sleep` return immediately |
| `EngineClock`    | drives the Camunda engine's clock and the SDK's together                  |

A local test clock makes the _SDK_ wait instantly, but the engine carries on in real
time — so a process that only completes once a BPMN timer fires still takes as long as
the timer says. `EngineClock` is for that case.

---
Source: https://docs.camunda.io/docs/next/apis-tools/go-sdk/clocks
