# Task analysis

Task analysis allows you to easily identify process instances that took significantly longer than others to complete a flow node.

Task analysis allows you to identify process instances that took significantly longer than others to complete a flow node, and subsequently slow down your process.


## Task analysis in action

Select a process definition you would like to analyze. Once a definition is selected, a **heatmap** is displayed, highlighting the flow nodes where Optimize identified many duration outliers.

In our example, the **Approve Invoice** task has duration outliers. Additionally, in the **Outliers** table, you can see how many instances were identified, how much longer they took than the average duration, and a list of related variables.

![task analysis example 1](./img/outlierExample_1_heatMap.png)

Click the node on the **heatmap** or use the **View Details** button in the table to directly see a duration distribution chart for the specific flow node. The duration distribution chart contains information about how long the identified outliers took, and also in comparison to the other flow node instance durations.

![task analysis example 2](./img/outlierExample_2_detailsModal.png)

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/task-analysis
