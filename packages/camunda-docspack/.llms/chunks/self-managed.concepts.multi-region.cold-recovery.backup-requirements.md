# Cold Recovery — Backup requirements

In addition to cross-region replication, you must make sure the following is in place before a failure occurs:

**Regular backup schedule**: Both Orchestration cluster and secondary storage must be backed up on a consistent schedule. Backup frequency directly determines RPO: a 1-hour backup interval means up to 1 hour of data loss in the worst case.

For configuration instructions and scheduling guidance, see [backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore).


## Recovery flow

When the primary region fails, Cold Recovery follows this sequence:

1. **Detect and declare**: Confirm the primary region is unavailable and initiate the recovery process.
2. **Fence the old region**: Before redirecting traffic, ensure the original region's cluster, job workers, and connectors are stopped or otherwise prevented from acting. See [fencing the old region](#fencing-the-old-region).
3. **Provision**: Spin up a new Camunda environment in the secondary region (or activate a pre-provisioned standby if one exists).
4. **Select restore point**: Identify the most recent complete, consistent backup set from the replica S3 bucket.
5. **Restore Camunda Orchestration cluster**: Follow the [restore procedure](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore).
6. **Start and verify**: Deploy the Orchestration Cluster against the restored data and confirm health before routing traffic.
7. **Redirect traffic**: Update applications, DNS or load balancer configuration to point production traffic at the secondary region.

The total elapsed time across all these steps is the realized RTO. For step-by-step restore instructions, see [backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore).

**Tip: Test the recovery flow**
We recommend testing this recovery flow end-to-end before a real incident occurs. Prior validation ensures each step works as expected in your environment.

**Important: Detection and decision time count toward RTO**
Step 1 (detect and declare) is **not instantaneous** and is often the largest variable contributor to total RTO. Time-to-detect (how long until the outage is recognized) and time-to-decide (how long until the on-call operator authorizes a failover) can each run from minutes to hours depending on monitoring coverage, paging rotation, and escalation policy. The published 1–4 hour RTO assumes these phases are exercised regularly; otherwise they dominate the realized recovery time.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery
