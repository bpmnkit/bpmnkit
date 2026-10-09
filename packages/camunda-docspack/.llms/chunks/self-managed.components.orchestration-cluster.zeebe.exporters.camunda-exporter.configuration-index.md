# Camunda Exporter — Configuration — index

Helm property path prefix for these options:
`camunda.data.secondary-storage.{elasticsearch|opensearch}.`

| Option                | Description                                                                                                                                                                                 | Default |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| numberOfShards        | The number of [shards](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html#_static_index_settings) used for each created index.                              | 1       |
| numberOfReplicas      | The number of shard [replicas](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules.html#dynamic-index-settings) used for each created index.                      | 1       |
| variableSizeThreshold | Defines a threshold for variable size. Variables exceeding this threshold are split into two properties: `FULL_VALUE` (full content, not indexed) and `VALUE` (truncated content, indexed). | 8191    |
| shardsByIndexName     | A map where the key is the index name and the value is the number of shards, allowing you to override the default `numberOfShards` setting for specific indices.                            |         |
| replicasByIndexName   | A map where the key is the index name and the value is the number of replicas, allowing you to override the default `numberOfReplicas` setting for specific indices.                        |         |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter
