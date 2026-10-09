# Overview — Import

These values relate to Optimize data import.

| YAML path                                  | Environment variable                                                  | Default value | Description                                                                                                                                                                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|                                            |
| import.skipDataAfterNestedDocLimitReached  | CAMUNDA_OPTIMIZE_IMPORT_DATA_SKIP_DATA_AFTER_NESTED_DOC_LIMIT_REACHED | false         | Some data can no longer be imported to a given document if its number of nested documents has reached the configured limit. Enable this setting to skip this data during import if the nested document limit has been reached. |
| import.currentTimeBackoffMilliseconds      |                                                                       | 300000        | The time interval the import backs off from the current tip of the time, to reread potentially missed concurrent writes.                                                                                                       |
| import.elasticsearchJobExecutorThreadCount |                                                                       | 1             | Number of threads being used to process the import jobs per data type that are writing data to Elasticsearch.                                                                                                                  |
| import.elasticsearchJobExecutorQueueSize   |                                                                       | 5             | Adjust the queue size of the import jobs per data type that store data to Elasticsearch. A too large value might cause memory problems.                                                                                        |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration
