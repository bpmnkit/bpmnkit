# @bpmnkit/core — Installation — Data elements and linked resources

Data elements sit beside the chain: they add no sequence flow and do not move the cursor.

```typescript
.serviceTask("t", { name: "T", taskType: "work",
  linkedResources: [{ resourceType: "RPA", resourceId: "script-1", linkName: "script" }] })
.dataObject("order", { name: "Order" })
.dataObjectReference("orderRef", "order", { name: "Order" })
.dataStoreReference("dbRef", "db", { name: "DB" })
.dataAssociation("t", "orderRef", "input")   // the task reads it
.dataAssociation("t", "dbRef", "output")     // the task writes it
```

Auto layout gives the data shapes a place but draws no association edges.

---
Source: https://bpmnkit.com/docs/packages/core
