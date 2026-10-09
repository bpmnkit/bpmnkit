# Multi-Region RDBMS operational procedure — Handle a region loss — planned

The region is still reachable, for example during a scheduled evacuation. A switchover completes replication before promoting, so no data is lost in the RDBMS. It also takes considerably less time than an unplanned failover.

Run the same script as in step 1, without `--dry-run`. It repeats the quorum report, then promotes a surviving member if the writer was in the lost region:

```bash
./failover.sh <lost-region-slot>
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
