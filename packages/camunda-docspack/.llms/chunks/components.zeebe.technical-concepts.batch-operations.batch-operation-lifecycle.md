# Batch operations — Batch operation lifecycle

Batch operations follow a structured lifecycle with distinct phases. Understanding these phases helps you monitor progress and troubleshoot issues.

### 1. Creation phase

**What happens:**

- User submits a batch operation request with filter criteria
- System performs validation checks
- The operation is distributed to all partitions in the cluster
- A **leader partition** is designated (the partition that first processes the creation command)
- All other partitions become **follower partitions**
- A unique batch operation key is generated and assigned

**Duration:** Milliseconds to seconds

**What can go wrong:** See [Creation request validation](#creation-request-validation) below.

### 2. Initialization phase

**What happens:**

- Each partition queries the secondary database using the provided filter
- Results are paginated and split into manageable chunks to avoid overwhelming exporters (each item in a chunk triggers a separate export operation)
- The total number of items to process is determined and fixed at this point
- Signals are sent to start the execution phase once initialization is complete

**Duration:** Seconds to minutes, depending on the number of matching instances, cluster size, and whether other batch operations are already queued for initialization. If multiple batch operations are created, they are initialized sequentially. Each operation must finish its initialization phase before the next one begins.

**API visibility:**
In [Get Batch Operation](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-batch-operation.api) API responses:

- The `operationsTotalCount` becomes eventually accurate once initialization completes on all partitions
- The batch operation `state` transitions from `CREATED` to `ACTIVE` once initialization finishes and execution is triggered

**What can go wrong:** See [Initialization failures](#initialization-failures) below.

#### Dependency on secondary storage

Although the broker's internal state stores process instance data, the secondary storage is queried because:

- RocksDB (our internal state database) is a key-value store, not optimized for complex queries.
- The secondary database (for example, Elasticsearch) efficiently supports complex filtering.
- The user interface enables filter-based batch creation, which RocksDB cannot support.
- Pagination and large result set handling is better supported by secondary databases.

### 3. Execution phase

**What happens:**

- Each partition processes its assigned items independently
- Individual commands (for example, `CANCEL`, `MIGRATE`) are executed on each process instance
- Progress is tracked and can be monitored
- Failed items are recorded with error details

**Duration:** Minutes to hours (depending on the number of instances and operation type)

**Key characteristics:**

- **Fire-and-forget execution**: Individual operation commands are dispatched immediately without blocking. While the system does not wait for each command to complete before dispatching the next one, you can still monitor overall batch progress and view failed items through the monitoring APIs.
- **Independent processing**: Each partition works independently, enabling parallel execution across the cluster

**What can go wrong:** See [Execution failures](#execution-failures) below.

### 4. Completion phase

**What happens:**

- Follower partitions report completion or failure to the leader partition
- Leader partition aggregates results from all partitions
- Final status is determined (`COMPLETED` if at least one partition succeeded, `FAILED` if all failed)

**Duration:** Seconds

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/batch-operations
