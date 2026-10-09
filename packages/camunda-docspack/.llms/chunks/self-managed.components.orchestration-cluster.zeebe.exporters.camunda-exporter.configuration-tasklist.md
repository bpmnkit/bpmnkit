# Camunda Exporter — Configuration — tasklist

Helm property path prefix for this Tasklist-specific export option: `camunda.data.secondary-storage.{elasticsearch|opensearch}.`

| Option                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                   | Default |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| skipVariableWriteWithoutUserTasks | If `true`, the exporter skips writing task variable data to the `tasklist-task` index for process definitions that do not contain any user task flow node instances. This reduces index size and improves write and read performance by avoiding the persistence of task data that is never queried through Tasklist. The exporter uses the process cache to determine whether a deployed process definition contains at least one user task. | `false` |

**Warning: Process instance migration limitation**
When `skipVariableWriteWithoutUserTasks` is enabled, task variable data is not exported for process definitions without user tasks. If a process instance is later [migrated](https://docs.camunda.io/docs/next/components/concepts/process-instance-migration) to a process definition version that **does** contain user tasks, variable data that was previously skipped is **not** retroactively backfilled. As a result, process-level variable filters in task search only match process instances that were created on a process definition version that already contained user tasks (that is, on or after the version introducing user tasks). For migrated instances, only variables exported **after** the migration (from new variable update events) appear in task search results.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/exporters/camunda-exporter
