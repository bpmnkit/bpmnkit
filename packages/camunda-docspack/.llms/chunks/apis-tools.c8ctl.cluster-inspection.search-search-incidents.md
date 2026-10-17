# Cluster inspection and process management — Search — Search incidents

```bash
c8 search inc --state=ACTIVE
c8 search inc --processInstanceKey=2251799813685249
c8 search inc --errorType=JOB_NO_RETRIES
c8 search inc --errorMessage='*timeout*'
c8 search inc --state=ACTIVE --errorType=JOB_NO_RETRIES

# Filter by creation time
c8 search inc --between=2025-03-01..2025-03-05
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
