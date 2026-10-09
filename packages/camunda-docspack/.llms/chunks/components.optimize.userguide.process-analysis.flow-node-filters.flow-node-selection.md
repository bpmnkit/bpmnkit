# Flow node filters — Flow node selection

In flow node and user tasks reports, all flow nodes are included in the result by default. This could result in many table rows or chart entries which makes the visualization hard to read. This filter allows you to specify which flow nodes are included and deselect the ones that are not relevant to the report.

![Specifying which nodes are included in the report](./img/flowNodeSelection.png)


## Flow node status filter

Some flow nodes can take a relatively long time to complete (e.g. user tasks or long-running service tasks). By default, a report includes all flow nodes in the calculations, whether they are currently running, canceled, or already completed. You can change this behavior by adding a flow node status filter as a [flow node data filter](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/filters#filter-behavior).

Adding one of the flow node status options will filter both instances and flow nodes according to the selected status:

- For instance reports: The filter will only include instances that have at least one flow node matching the filter criteria. This behavior can be seen if you are in variable, incident, or raw data reports.
- For flow node reports: Flow nodes that do not match the filter criteria will be excluded from the results.

This behavior can be seen if you are in flow nodes or user task reports.

Here are the possible options for this filter:

- Running flow nodes only: Your report will only collect information from flow nodes that are currently running.
- Completed flow nodes only: Considers only successfully completed flow nodes.
- Canceled flow nodes only: Considers only canceled flow nodes.
- Completed or canceled flow nodes only: Considers all completed flow nodes regardless of whether they were canceled or not.

**Note**
For incident reports, flow node status filters always behave as instance filters and do not filter flow nodes.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/flow-node-filters
