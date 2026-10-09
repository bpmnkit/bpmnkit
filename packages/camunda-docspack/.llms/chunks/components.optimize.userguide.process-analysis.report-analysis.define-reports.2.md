# Define reports — (2)

Not all the above view, group by, and visualization options can be combined. For instance, if you choose `Flow Node: Count` as view, the data is automatically grouped by flow nodes as no other combination would be valid.

All possible combinations can also be found in the following table:

| View                                                | Group by                                                        | Visualize as          |
| --------------------------------------------------- | --------------------------------------------------------------- | --------------------- |
| Raw Data                                            | None                                                            | Table                 |
| Process instance: Count, Process instance: Duration | None                                                            | Number                |
| Process instance: Count                             | Start Date, End Date, Running Date, Variable, Duration, Process | Table, Chart          |
| Process instance: Duration                          | Start Date, End Date, Variable, Process                         | Table, Chart          |
| Incident: Count, Incident Duration                  | None                                                            | Number                |
| Incident: Count, Incident Duration                  | Flow Nodes                                                      | Table, Chart, Heatmap |
| Flow Node: Count, Flow Node: Duration               | Flow Nodes                                                      | Table, Chart, Heatmap |
| Flow Node: Count                                    | Start Date, End Date, Duration, Variable                        | Table, Chart          |
| Flow Node: Duration                                 | Start Date, End Date, Variable                                  | Table, Chart          |
| User Task: Count, User Task: Duration               | User Tasks                                                      | Table, Chart, Heatmap |
| User Task: Count, User Task: Duration               | Start Date, End Date, Assignee, Candidate Group                 | Table, Chart          |
| User Task: Count                                    | Duration                                                        | Table, Chart          |
| Variable                                            | None                                                            | Number                |

**Note**
You might sometimes see a warning message indicating that the data is limited to a certain number of points. This happens because the available stored data, in this case is very large, and it is not possible to display all the data in the selected visualization.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/report-analysis/define-reports
