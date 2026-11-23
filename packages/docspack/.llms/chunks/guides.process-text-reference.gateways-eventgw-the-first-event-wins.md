# BPMN Kit Text — element reference — Gateways — `eventgw` — the first event wins

An event-based gateway leads to catch events. The first one that happens takes the path.

```bpmnkit-text
# Race
s[start Quote sent] > race[eventgw Wait]
race > answer[catch:message Customer answers | msg=answer key=quoteId] > e[end Answered]
race > late[catch:timer Seven days | after=P7D] > e2[end Expired]
```

```typescript
const defs = Bpmn.createProcess("race-process")
  .name("Race")
  .startEvent("s", { name: "Quote sent" })
  .eventBasedGateway("race", { name: "Wait" })
  .branch("answer", (b) => b.intermediateCatchEvent("answer", { name: "Customer answers", messageName: "answer", correlationKey: "= quoteId" }).endEvent("e", { name: "Answered" }))
  .branch("late", (b) => b.intermediateCatchEvent("late", { name: "Seven days", timerDuration: "P7D" }).endEvent("e2", { name: "Expired" }))
  .build()
```

---
Source: https://bpmnkit.com/docs/guides/process-text-reference
