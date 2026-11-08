# @bpmnkit/api — Incident Resolution

```typescript
// Find all incidents for a process instance
const { items: incidents } = await client.incident.searchIncidents({
  filter: { processInstanceKey: instance.processInstanceKey },
});

// Fix the problem in your code, then resolve
for (const { incidentKey } of incidents) {
  if (incidentKey) await client.incident.resolveIncident(incidentKey);
}
```


## Message Correlation

```typescript
await client.message.publishMessage({
  name: "payment-confirmed",
  correlationKey: "ord-456",
  variables: {
    paymentMethod: "card",
    confirmedAt: new Date().toISOString(),
  },
  timeToLive: 60_000,   // ms — how long to wait for a matching instance
});
```

---
Source: https://bpmnkit.com/docs/packages/api
