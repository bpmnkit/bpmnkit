# Process dashboards — KPI import scheduler

Since users might be dealing with hundreds or even thousands of KPIs, a scheduler has been developed which updates the KPI values on a given interval. The default interval in which the KPIs get updates is 10 minutes.

To change this interval, modify the configuration value for **entity.kpiRefreshInterval**. For more information, visit the relevant [configuration section](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration).


## Limitations

Since the updates on the KPIs will appear on the process overview page after the given KPI import scheduler interval has passed, changes such as creation, update and deletion of KPIs will show with a delay. In case you wish to make these changes apparent more promptly, you can set the KPI scheduler interval to a lower value as described above.

Additionally, it is worth mentioning that for the evaluation of the KPI reports, the default timezone of the machine on which Optimize is being run on will be used.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-dashboards
