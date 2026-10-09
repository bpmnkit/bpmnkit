# Flow node filters — Flow node date filter

Similar to process instance date filters, flow node date filters allow you to filter the report based on flow node start or end dates.

**Note**
Reports with a flow node end date filter will only consider data from completed flow nodes.

This filter type can be applied either as a [process instance](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/filters#filter-behavior) or as a [flow node](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/filters#filter-behavior) filter:

- When applied as a process instance filter, you are required to select the flow nodes that are to be relevant to the filter, yielding a report which will only consider those process instances where one or more of the selected flow nodes match the configured filter.

![Flow Node date filter](./img/flowNode-date-filter.png)

- When added as a flow node filter, there is no flow node selection. The resulting report automatically only includes data from those flow nodes which match the given filter.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/flow-node-filters
