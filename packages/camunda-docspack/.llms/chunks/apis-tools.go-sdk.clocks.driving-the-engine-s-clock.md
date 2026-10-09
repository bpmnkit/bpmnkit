# Clocks — Driving the engine's clock

`EngineClock` pins the engine's clock instead of passing time locally:

```go
// The control client issues the pin requests and keeps real time itself.
control, err := camunda.New(camunda.WithRestAddress(addr))
if err != nil {
	return err
}
clock := camunda.NewEngineClock(control)

// Anything this client waits on now advances the engine instead of real time.
client, err := camunda.New(camunda.WithRestAddress(addr), camunda.WithClock(clock))
if err != nil {
	return err
}
```

A wait now moves the engine forward and reports the new instant, so the SDK and the
engine agree on what time it is. Waits that overlap — those that read the clock before
any of them lands — settle at a single instant rather than summing; a wait that begins
after an earlier one has landed reads the new time and composes from it. `PinTo` and
`Reset` are available directly for tests that need to move the engine without waiting.

Clock pinning is an alpha engine endpoint, intended for tests rather than production
clusters. Pass the control client the pin requests should travel on: it keeps real
time, so the requests themselves are unaffected by the pinning.

---
Source: https://docs.camunda.io/docs/next/apis-tools/go-sdk/clocks
