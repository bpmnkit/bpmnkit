# Dual-region setup (ECS Fargate) — Architecture decisions — Secondary storage replication lag

Aurora Global Database replicates asynchronously, so promoting a new writer can leave it missing whatever had not reached it yet. Camunda retains the source records needed to recover that gap; Aurora replication alone does not prevent it.

Exporting and acknowledging are separate steps. The RDBMS exporter writes a record to the Aurora writer, then tells the broker the record is safe only after the required replica quorum confirms the flush marker. This architecture sets `min-sync-replicas` to one, so the single Aurora reader must confirm the marker before the exporter acknowledges the position. Until then, the record continues to occupy the Zeebe log. Holding that position back is enough to keep segments on disk; releasing them is not this exporter's decision alone, since [compaction](https://docs.camunda.io/docs/next/self-managed/concepts/exporters) tracks the slowest consumer on the partition.

If the required replica falls behind, acknowledgement is held back and the Zeebe log grows. The replica catches up from the writer, not from Zeebe. The retained records matter when the writer itself is lost: the promoted reader resumes from its own position, and Zeebe replays the gap.

The reference architecture pins four properties under `camunda.data.secondary-storage.rdbms.`, shortened in the table below. [Multi-region support](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#multi-region-support) documents what each one does, including which vendors support `LOG_SEQ` and how the `DELAY` alternative behaves. The table records only which values this architecture picks and why.

| Setting                                       | Value     | Why this value here                                                                                                                                            |
| --------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `async-replication.enabled`                   | `true`    | Off by default. This architecture delegates replication to Aurora and treats a writer failover as routine, so the monitoring is not optional.                  |
| `async-replication.type`                      | `LOG_SEQ` | The preferred strategy, and Aurora Global Database with PostgreSQL supports it. The `DELAY` fallback would add a static wait to every acknowledgement instead. |
| `async-replication.max-lag`                   | `PT1H`    | Sized for a cross-region promotion under load, which runs past the `PT15M` default.                                                                            |
| `async-replication.pause-on-max-lag-exceeded` | `false`   | The engine default, kept deliberately.                                                                                                                         |

`max-lag` is pinned even though pausing is off, so the budget is already sized if you turn pausing on later, which is then a one-line change. Under `LOG_SEQ`, this value is compared with the age of the oldest exporter position still waiting for confirmation, not with a lag figure reported by Aurora. Turn pausing on only once you have alerting on replication lag. It makes a stall loud, because the exporter logs a warning and every later export raises an `ExporterException`, but writes to Aurora stop, so secondary storage stays stale until replication recovers. It protects nothing that acknowledgement does not already protect, since a record is reported safe to the broker only after confirmed replication either way.

EFS is elastic rather than a fixed-size volume, but a long outage still increases stored data, throughput use, and cost. Monitor EFS storage growth and throughput, and alert on replication lag.

An unsupported vendor or a non-global Aurora instance fails while the exporter is starting, and the message names the reason, so the deployment never comes up quietly without the replication signal. Later failures differ by where they happen. A replication status read that fails is logged and retried at the next poll. A failure to capture the replication marker while flushing pauses exporting instead, until the periodic checks recover. On the Aurora path the database privileges are exercised by those reads rather than checked at startup.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
