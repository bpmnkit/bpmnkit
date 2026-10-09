# Cluster inspection and process management — Search — Search process instances

```bash
c8 search pi --state=ACTIVE
c8 search pi --id=order-process
c8 search pi --businessId=order-123
c8 search pi --processDefinitionKey=2251799813685249
c8 search pi --parentProcessInstanceKey=2251799813685250
c8 search pi --id=order-process --state=ACTIVE

# Filter by date range
c8 search pi --between=2025-01-01..2025-03-31
c8 search pi --between=2025-01-01..2025-06-30 --dateField=endDate
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
