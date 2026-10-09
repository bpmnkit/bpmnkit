# Define reports — User task reports

For information about Optimize user task analytics, refer to our [task analysis documentation](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/task-analysis).


## Process instance reports

Refer to the table below for the process instance count and duration reports that support a second "Group by":

| View                             | Group by               | Second group by                                                   |
| -------------------------------- | ---------------------- | ----------------------------------------------------------------- |
| Process Instance Count, Duration | Start Date, End Date   | Variable, Process (only for multi-definition reports)             |
| Process Instance Count, Duration | Variable               | Start Date, End Date, Process (only for multi-definition reports) |
| Process Instance Count           | Running Date, Duration | Process (only for multi-definition reports)                       |

The diagram below shows a report grouped by `Start Date` and a boolean variable:

![Distributed process instance report](./img/distributedByVar.png)

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/report-analysis/define-reports
