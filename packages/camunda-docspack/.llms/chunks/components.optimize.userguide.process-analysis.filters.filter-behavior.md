# Overview — Filter behavior

There are two ways to filter data in Optimize:

1. Instance filters: All filters can be used to filter instances in single reports and during branch analysis.
2. Flow node data filters: These filters can be used if you not only want to filter instances, but you additionally need to filter the content of instances (for example, flow nodes). Since not all filters can be applied on flow nodes, only compatible ones can be used as a flow node data filter. Flow node filters also exclude all instances from the result which do not contain at least one flow node that matches the filter.

To summarize, instance filters remove rows, while flow node data filters remove columns.

Additionally, if the report contains multiple processes, filters need to specify which definition they apply to. Some filters can apply to multiple definitions at once, while other filters are specific to a certain process definition. For example, because they rely on the flow nodes present in the definition.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/filters
