# Metadata filters — Combined filters

All the previously mentioned filters can be combined. Only those process instances which match all the configured filters
are considered in the report or analysis. The [duration filter](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/process-instance-filters#process-instance-duration-filter), [flow node filter](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/flow-node-filters), and [variable filter](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/variable-filters) can be defined several times. See the following screenshot for a possible combination of filters:

![Combined filter in Camunda Optimize](./img/combined-filter.png)

Everyone who has access to the report can add their own filters. For example, by creating a dashboard that contains that report and using dashboard filters. Note that filters can apply to all processes or a subset of processes.

Filters added in such a way are always combined with the filters set in the report edit mode. That way, users can reduce the set of process instances that are considered when evaluating the report, but not increase the number of instances evaluated above the set the report author specified.

In essence, if two copies of the same process are present, Optimize combines them with OR logic, and their filters or variables can be combined with the same logic. Therefore, it's possible to compare two differently filtered slices of the same process on the same report (with the group by process feature) or combine them (without group by process).

Users can get access to a report via the sharing functionality or if the report is in a shared collection.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/metadata-filters
