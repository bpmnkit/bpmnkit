# Metadata filters

Learn more about metadata filters, like date filters, assignee and candidate group filters, and more.


## Date filters

In Optimize, there are two kinds of date filters: the start and the end date filter. Each of these filters can be applied on [process instance](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/process-instance-filters#process-instance-date-filter) and on [flow node](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/flow-node-filters#flow-node-date-filter) dates.

There are multiple ways in which you can define your date filters:

- Set the filter to a current amount of time. For example, today, this week, this month, etc. In such cases, the filter does not remain static, but moves with time to deliver a subset of the data according to the selected time interval.

**Note**
Within date filters, weeks begin on Monday, not Sunday. This is not configurable in Optimize.

- Set it to a previous amount of time. For example, yesterday, last week, last month, etc. This filter also moves with time and is automatically adjusted to cover completed periods of time.

Take the following example: Today is Wednesday, March 11. If you set a process instance start date filter to `Last... + week`, you get all process instances that were started from Monday, March 2 to Sunday, March 8. A week passes, and we now have Wednesday, March 18. Applying the same filter now filters the process instances which were started from Monday, March 9 to Sunday, March 15.

- To cover previous time periods up the current moment of time, you can use the 'Rolling' option.

Take the following example: today is March 28. If you set a process instance start date filter to the last three days, you get all process instances that were started from March 26 to March 28. A day passes, and we now have March 29. Applying the same filter now filters the process instances which were started from March 27 to March 29.

- If you do not want the filter to be completely dynamic, you can also select `Between`, `Before`, or `After`.
- The `Between` option only considers process instances started or ended within a fixed date range (e.g. filter all process instances between 2018-01-01 and 2018-01-26). This range is fixed and does not change.
- In the same way, you can select `After` or `Before` options to only consider process instances that started or ended after/before a fixed date.

The start and the end date filters are independent and can be applied to a report simultaneously. However, be aware that each of these filters can only exist once. If, for example, you define a new start date filter when another one already exists, the second one will replace the first one.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/metadata-filters
