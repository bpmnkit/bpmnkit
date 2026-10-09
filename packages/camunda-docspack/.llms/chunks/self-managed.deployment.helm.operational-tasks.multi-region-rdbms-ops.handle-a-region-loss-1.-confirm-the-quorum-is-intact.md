# Multi-Region RDBMS operational procedure — Handle a region loss — 1. Confirm the quorum is intact

The surviving zones keep processing if they hold a majority of each partition's replicas. The [concept page](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-region-loss) explains when this holds.

A cluster with only two zones, such as `2-2` before you add the third region, has no such margin. Losing either zone leaves two replicas of four, and processing stops.

Confirm this rather than assuming it. The script takes one lost slot and computes the surviving replicas without it. Its verdict only covers a single lost zone. If more than one zone is affected, the reference procedures don't cover the situation. Read the partition health of the surviving brokers from `GET /actuator/cluster` on a surviving region instead. Don't use `./check-cluster-topology.sh` here: it expects every active region to be up.

```bash
./failover.sh <lost-region-slot> --dry-run
```

With `--dry-run`, the script reports the quorum state, prints the current cluster view, and warns if the surviving zones no longer hold a majority. It changes nothing, so you can read the verdict before deciding to act.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
