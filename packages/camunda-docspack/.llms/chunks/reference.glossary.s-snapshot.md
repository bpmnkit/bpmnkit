# Glossary — S — Snapshot

The state of all active [process instances](#process-instance), (these are also known as inflight process instances) are stored as records in an in-memory database called RocksDB. A snapshot represents a copy of all data within the in-memory database at any given point in time. Snapshots are binary images stored on disk and can be used to restore execution state of a [process](#process). The size of a snapshot is affected by the size of the data. Size of the data depends on several factors, including complexity of the [model](#bpmn-model), the size and quantity of variables in each process instance, and the total number of executing [process instances](#process-instance) in a [broker](#zeebe-broker).

- [Resource planning](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed#snapshots)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
