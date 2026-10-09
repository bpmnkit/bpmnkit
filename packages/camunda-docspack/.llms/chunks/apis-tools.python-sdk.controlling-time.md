# Controlling time

# Controlling time

Every wait inside the SDK -- worker poll intervals, retry backoff, backpressure decay,
eventual-consistency polling -- resolves through an injected clock rather than
`asyncio.sleep` or `time.sleep`. Pass your own to make that cadence yours:

| Clock         | Use                                                                                  |
| ------------- | ------------------------------------------------------------------------------------ |
| `LiveClock`   | the default; real time, with backward wall-clock jumps absorbed rather than reported |
| `ManualClock` | tests; virtual time, so a poll loop settles without waiting                          |
| `EngineClock` | drives the Camunda engine's clock and the client's together                          |

---
Source: https://docs.camunda.io/docs/next/apis-tools/python-sdk/controlling-time
