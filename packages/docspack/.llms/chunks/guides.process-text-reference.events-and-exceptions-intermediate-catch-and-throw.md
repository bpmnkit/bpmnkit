# BPMN Kit Text — element reference — Events and exceptions — Intermediate catch and throw

`catch:timer` waits (`after=` is an ISO duration). `throw:signal` and `throw:escalation` raise
something. `throw:message` is a message throw event; `catch:message` needs `msg=` and `key=`.

```bpmnkit-text
# Wait, then signal
s[start Started] > wait[catch:timer Wait an hour | after=PT1H] > ping[throw:signal Tell others | signal=wake-up] > e[end Done]
```

```typescript
const defs = Bpmn.createProcess("wait-signal")
  .name("Wait, then signal")
  .startEvent("s", { name: "Started" })
  .intermediateCatchEvent("wait", { name: "Wait an hour", timerDuration: "PT1H" })
  .intermediateThrowEvent("ping", { name: "Tell others", signalName: "wake-up" })
  .endEvent("e", { name: "Done" })
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
