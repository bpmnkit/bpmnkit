# Configure reports — Chart goal line

Optimize allows you to set a goal line in bar chart and line chart visualizations. Using this feature, it is possible to highlight anything above or below a certain value.

A good use case for such functionality is the following example:

First, go to the edit mode of a report and choose the following configuration:

| View         | Count frequency of process instance   |
| ------------ | ------------------------------------- |
| Group by     | Start date of process instance: Month |
| Visualize as | Bar chart                             |

Let us say that the number of completed process instances should always be above six. A goal line can be used as follows:

Set the target value input field to six and select the above button. If the number of process instances is below six, it will be highlighted in red as shown:

![Bar charts goal line](./img/targetValue.png)

This feature can be also used with every other bar chart and line chart visualization. Here is another example where the target value is used with line chart visualization:

![Line chart goal line](./img/targetline.png)

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/report-analysis/configure-reports
