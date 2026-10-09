# Cluster inspection and process management — Search — Search jobs

```bash
c8 search jobs --type=email-service
c8 search jobs --state=CREATED
c8 search jobs --processInstanceKey=2251799813685249
c8 search jobs --type=email-service --state=CREATED

# Filter by date range
c8 search jobs --between=2025-01-01..2025-12-31
c8 search jobs --between=2025-01-01..2025-12-31 --dateField=lastUpdateTime
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
