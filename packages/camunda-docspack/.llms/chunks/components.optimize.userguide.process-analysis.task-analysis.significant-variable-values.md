# Task analysis — Significant variable values

When looking at the duration outlier instances, you can analyze the data further to find the root cause of why these instances took so long. Look at the significant variables table that lists significant variable values in the outlier instances.

This also allows you to see how many times this variable value occurred in the outlier instances compared to the rest of the process instances. This can give you a good idea of if there is a correlation between a variable value and a flow node taking longer than expected. In our example, we can see that for most of our duration outliers the delay variable was set to `true`.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/task-analysis
