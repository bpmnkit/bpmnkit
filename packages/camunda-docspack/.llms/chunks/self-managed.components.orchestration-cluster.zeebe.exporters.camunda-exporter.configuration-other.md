# Camunda Exporter — Configuration — other

Helm property path prefix for these options:
`camunda.data.secondary-storage.{elasticsearch|opensearch}.batch-operations.`

Other miscellaneous properties:

| Option                               | Description                                                                                                                                                                                                                                                                                                                                                                                 | Default |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| batchOperation.exportItemsOnCreation | Defines whether the pending items of a started batch operation should be exported from the beginning. For very large batch operations involving more than 100,000 process instances, this can cause temporary performance issues due to the high volume of document insertions. If set to `false`, the "has pending batch operations" spinner in the Operate UI will not function properly. | `true`  |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter
