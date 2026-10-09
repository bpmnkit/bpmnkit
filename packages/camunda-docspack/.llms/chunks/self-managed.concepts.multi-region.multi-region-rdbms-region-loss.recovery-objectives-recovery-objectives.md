# Region loss and recovery in Multi-Region RDBMS — Recovery objectives {#recovery-objectives}

With three or more running regions, and no zone holding half the replicas or more, a region loss needs no recovery procedure, but it still opens a recovery window. For other layouts, see [Remove a lost zone](#remove-a-lost-zone).

Under those conditions, recovery needs no procedure, because on the engine a zone loss is the same class of event as a broker loss.

A single-region cluster that loses a broker holds a Raft re-election for the partitions that broker led, and its clients reconnect to the new leaders. Losing a zone runs the same sequence over the same protocol:

- No restore, and no backup to replay.
- No judgment call about whether the failure is temporary or permanent.

That is the difference from [Dual-Region](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region), where the same event costs the quorum and processing stops until an operator intervenes.

Recovery has a window, because reconfiguration takes time. Most of that window depends on settings outside the engine: client timeouts and retries, traffic routing, database failover, and Camunda's own SQL connection timeouts. This section therefore gives the order of magnitude of each part instead of one RTO figure.

Data loss depends on which store you mean. The engine's own state loses nothing. Raft commits a record only once a majority of its replicas hold it. Under the default `2-2-1` layout, a commit needs three replicas of five. Losing one zone removes at most two, so at least one surviving replica has the record.

Secondary storage is different, because the database replicates asynchronously. In the table, `min-sync-replicas` stands for `camunda.data.secondary-storage.rdbms.async-replication.min-sync-replicas`, the number of standbys that must confirm a record. An unplanned promotion can omit records that had not reached the promoted standby.

| Strategy   | Secondary-storage RPO | Condition                                                                                                                        |
| :--------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `LOG_SEQ`  | 0                     | The promoted standby is one of the standbys counted by `min-sync-replicas`. This is always the case with a single standby.       |
| `TIME_LAG` | 0                     | Same as `LOG_SEQ`: the promoted standby is one of the standbys counted by `min-sync-replicas`.                                   |
| `DELAY`    | 0                     | The actual replication lag stays below the configured delay. The exporter observes no replication state, so you monitor the lag. |

The database's own failover can still lose up to its replication lag. Every strategy holds back Zeebe log compaction, so Camunda replays the missing records from the retained log after promotion. The table describes that combined result.

That makes the guarantee conditional on replication configuration and disk capacity rather than on the architecture alone. Retained log segments accumulate for as long as records remain unacknowledged. Size the volume for your write rate and the longest replication outage you plan to tolerate, and alert on broker disk usage.

`pause-on-max-lag-exceeded` decides what happens once the lag passes the configured threshold. It is off by default, and it caps neither data loss nor retained log growth. With `LOG_SEQ` and `TIME_LAG`, acknowledgement waits for confirmed replication either way, so the unacknowledged position holds the log either way. With `DELAY`, acknowledgement only waits for the configured delay and confirms no replication state. With it off, exporting continues against a database that is already behind. With it on, exporting stops, so secondary storage receives nothing new and the APIs reading it fall behind the engine until replication recovers. Enable it deliberately, once you have alerting on replication lag.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-region-loss
