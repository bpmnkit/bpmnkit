# Rebalancing — Manual rebalancing — Limitations

Manual rebalancing is not guaranteed to succeed for every partition in every attempt, but it never fails silently: each partition transfer ends in an explicit, reported outcome, and a partition that cannot be rebalanced keeps its current leader rather than being left leaderless.

Before transferring leadership for a partition, the coordinator checks the desired leader's replication lag against `replicationLagThreshold`. If the lag is already too high, the transfer is rejected immediately with `LAG_TOO_HIGH` and the partition does not enter the paused state.

If the lag is within tolerance, the partition is paused and the desired leader is given up to `replicationTimeout` to catch up:

- If it catches up in time, leadership transfers to it and the pause is lifted.
- If it does not catch up in time, the transfer ends with `REPLICATION_TIMED_OUT` and the partition resumes under its current leader.

Once caught up, the coordinator prompts the desired leader to take over, retrying up to `maxTransferAttempts` times. If leadership still hasn't moved, the transfer ends with `TIMEOUT_NOW_EXHAUSTED` and the partition again resumes under its current leader.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing
