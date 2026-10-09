# Cluster inspection and process management — Search — Search user tasks

```bash
c8 search ut --state=CREATED
c8 search ut --assignee=john.doe
c8 search ut --processInstanceKey=2251799813685249
c8 search ut --elementId=UserTask_Approve
c8 search ut --state=CREATED --assignee=john.doe

# Filter by date range
c8 search ut --between=2025-03-01..2025-03-31
c8 search ut --between=2025-03-01..2025-03-31 --dateField=dueDate
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
