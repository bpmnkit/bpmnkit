# Batch operations — Performance impact — Configuration

Batch operation behavior can be configured through broker settings under `camunda.processing.engine.batch-operations.*`. All settings are validated at startup, and invalid values will cause the broker to fail with a descriptive error message.

**Note**
Default values are optimized for typical workloads. Only adjust these settings if you experience performance issues or have specific requirements.

#### Scheduler settings

Controls how frequently the batch operation scheduler checks for work:

| Parameter           | Type     | Default    | Description                                                                                                                                                                                      |
| ------------------- | -------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `schedulerInterval` | Duration | **`PT1S`** | How often the background scheduler runs to progress initialization and continuation of batch operations.**Impact:** Lower values provide faster responsiveness but increase CPU usage. |

#### Chunking and pagination settings

Controls how batch operations split large result sets into manageable pieces:

| Parameter           | Type | Default     | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ---- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chunkSize`         | int  | **`100`**   | Maximum number of items per chunk. This controls both the number of items written per chunk record during initialization and the number of items stored per chunk in RocksDB state.**Note:** The default value of 100 is a reasonable tradeoff between the number of records and exporter performance. Values greater than 3000 are not recommended, as the broker logs a warning. Higher values may lead to performance issues in the exporters and can exceed the 4 MB record size limit.**RocksDB optimization:** A chunk size of 3000 item keys results in approximately 24 KB (31 KB with overhead), which aligns well with RocksDB's 32 KB block size for efficient read/write performance. |
| `queryPageSize`     | int  | **`10000`** | Page size when querying the secondary database during initialization.**For Elasticsearch/OpenSearch:** This interacts with the default 10,000 result window limit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `queryInClauseSize` | int  | **`1000`**  | Maximum number of keys in a single IN clause when querying by key list.**Use case:** Primarily for RDBMS-based secondary databases.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

#### Retry and error handling settings

Controls how the system handles transient failures when querying the secondary database:

| Parameter                 | Type     | Default     | Description                                                                                                                                                                                                                                             |
| ------------------------- | -------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `queryRetryMax`           | int      | **`0`**     | Maximum number of retry attempts for transient query failures (for example, network timeouts, temporary database unavailability).**Default behavior:** Retries are disabled by default (set to `0`). Set to a higher value to enable retries. |
| `queryRetryInitialDelay`  | Duration | **`PT1S`**  | Initial delay before the first retry attempt.**Behavior:** Each subsequent retry uses exponential backoff.                                                                                                                                    |
| `queryRetryMaxDelay`      | Duration | **`PT60S`** | Maximum delay between retry attempts.**Constraint:** Must be greater than or equal to `queryRetryInitialDelay`.**Purpose:** Prevents excessive wait times.                                                                               |
| `queryRetryBackoffFactor` | double   | **`2.0`**   | Multiplier applied to the delay between consecutive retries.**Example:** With factor `2.0` and initial delay `PT1S`, retries occur at 1s, 2s, 4s, 8s, and so on (capped by `queryRetryMaxDelay`).                                             |

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/batch-operations
