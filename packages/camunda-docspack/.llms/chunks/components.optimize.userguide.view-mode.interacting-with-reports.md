# Monitor dashboards — Interacting with reports

To see more details about the report on the dashboard, interact with the reports. The kind of interaction always depends on the report itself.

If the interactions do not suffice to get the desired information, or you want to edit the report, directly access the report by clicking on its title.


## Adding filters in view mode

In the dashboard view mode, there is a **Filters** button which opens a panel that shows all filters available for this dashboard. More filters can be made available in the dashboard edit mode. If the dashboard editor checked the **Allow viewer to add filter values** box for assignee, candidate group, or variable filters, dashboard viewers can add their own values to filter by.

![filters in view mode](./img/filter-viewMode.png)

Filters apply to all process reports on the dashboard. If a report already has filters set, they will be combined with the dashboard filter. For example, if a report has a filter to only show running instances and a dashboard filter for suspended instances is set, the report will only show instances that are both running and suspended. Dashboard filters are not applied to decision reports, external websites, or text tiles.

Variable filters are only applied to reports whose process definition includes the variable. Otherwise, the filter is ignored for that report. Other dashboard filters and filters defined directly on the report are still applied.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/view-mode
