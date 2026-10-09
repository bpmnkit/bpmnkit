# Multi-Region RDBMS operational procedure — Handle a region loss — 5. Verify the degraded cluster

```bash
./verify-degraded-cluster.sh <lost-region-slot>
```

The cluster should report the surviving brokers, all partitions healthy, and processing continuing.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
