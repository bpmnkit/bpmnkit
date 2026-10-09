# Flow node filters — Flow node duration filter

If the **Flow Node Duration Filter** is applied as an instance filter, it will only regard process instances where one or more flow nodes took a certain amount of time for their execution. For instance, you can filter process instances where a flow node took more than three days or less than five seconds.

If applied as a flow node filter, it will filter flow nodes and only show the flow nodes that were selected in the filter.

![Flow Node duration filter in Camunda Optimize](./img/flowNode-duration-filter.png)

**Note**
For incident reports, flow node duration filters always behave as instance filters regardless of where they were defined.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/flow-node-filters
