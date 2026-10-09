# RDBMS configuration overview — Exporter cache configuration

| Property name                    | Description                                                      | Default |
| -------------------------------- | ---------------------------------------------------------------- | ------- |
| `process-cache.max-size`         | Maximum number of process definitions held in the exporter cache | 1000    |
| `batch-operation-cache.max-size` | Maximum number of cached batch operations                        | 1000    |


## Multi-region support

Multi-region support for RDBMS uses the asynchronous replication feature of the underlying database and is highly
dependent on the database vendor. While most multi-region replication is performed by the database itself, Camunda
provides additional features to enhance automatic recovery in the event of a failure.

For an architecture built on this model, in which every region writes to a single endpoint and a region loss does not
stop processing, see [Multi-Region RDBMS](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms).

Asynchronous replicated databases are synchronized with a delay, meaning that after a failover, the new primary database
may not contain all the data written to the old primary database. This can lead to data loss in secondary storage. While
this data can be reproduced by replaying past records from the Zeebe log stream, the relevant segments and records must still
be present on all brokers. Zeebe's logstream segments are usually compacted as soon as all exporters have acknowledged the
records.

Camunda supports different strategies to handle this situation and preventing Zeebe log stream segments from being
compacted prematurely.
The following strategies are supported:

- **LSN replication monitoring:** dynamic monitoring of the replication lag based on the database LSN. This is the most
  preferred strategy and should be used whenever possible with the used database vendor.
- **Delay backoff replication monitoring:** Adds a static delay to the acknowledgement of records to the broker.

**Note**
Deferring the logstream compaction with either strategy may drastically increase the disk space usage of the logstream.
It is recommended to monitor the disk space usage and adjust the disk size or delay limit accordingly.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
