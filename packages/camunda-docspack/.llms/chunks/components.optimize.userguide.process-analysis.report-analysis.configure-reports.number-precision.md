# Configure reports — Number precision

Number precision can be configured from the panel to limit the most significant units to be shown.

For example, we have a report that calculates the total process instances duration. When the precision limit is not set, you will see all possible units, e.g.: `1y 5m 2wk 5d 3h 16min 3s 170ms`. In case you are only interested in certain units - e.g. months - you can omit all insignificant units by limiting the precision as shown in the figure below:

![Number report configurations](./img/NumberConfiguration.png)


## Number goal value (progress bar)

Number reports appear as progress bar when the goal option is enabled from the panel as shown. The baseline and the target value of the progress bar can be also set using the panel.

![Progress Bar Visualization](./img/progressbar.png)

You can toggle between the progress bar and the single number visualization using the same goal line switch.

A red line indicator appears on the progress bar when its value exceeds the goal value. On the right side of the indicator, the bar turns into a darker color to clearly show the exceeded amount.

![Progress Bar Visualization](./img/progressbarExceeded.png)

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/report-analysis/configure-reports
