# Camunda 8 Deployment — Querying Instances

```typescript
// List running instances
const instances = await client.processInstance.searchProcessInstances({
  filter: { processDefinitionId: "invoice-approval", state: "ACTIVE" },
});

// Get a specific instance
const instance = await client.processInstance.getProcessInstance("2251799813685249");

// Get its variables
const variables = await client.variable.searchVariables({
  filter: { processInstanceKey: instance.processInstanceKey },
});
```


## Managing Incidents

```typescript
// List open incidents
const incidents = await client.incident.searchIncidents({
  filter: { state: "ACTIVE" },
});

// Resolve an incident (after fixing the underlying issue)
for (const { incidentKey } of incidents.items) {
  if (incidentKey) await client.incident.resolveIncident(incidentKey);
}
```

---
Source: https://bpmnkit.com/docs/guides/deployment
