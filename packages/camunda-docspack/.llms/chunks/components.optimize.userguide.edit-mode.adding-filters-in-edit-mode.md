# Configure dashboards — Adding filters in edit mode

In dashboard edit mode, click **Add a Filter** to reveal the **Filters** panel. Specify filters for the dashboard, including start and end dates, process instance states (running, completed, or canceled), variable values, assignees, and candidate groups:

- Start date: Allows filtering by process instance start date
- End date: Allows filtering by process instance end date
- Instance state: Allows filtering by process instance state, such as running, completed, or canceled
- Variable: Allows filtering by process variable value
- Assignee: Allows filtering flow node data by their assignee
- Candidate Group: Allows filtering flow node data by their candidate group

![filter edits](./img/filter-editMode.png)

For Variable Filters, define the variable and provide a list of values for filtering. Optionally, allow viewers to add their own filter values by checking the **Allow viewer to add filter values** box. Unlike report filters, adding a value here doesn't immediately apply; it only makes the value available for dashboard filtering.

For Assignee and Candidate Group filters, specify available options. Similarly, allow viewers to add their values.

The list of variable names, values, assignees, and candidate groups is compiled from all reports on the dashboard.

### Setting a default dashboard filter

After specifying filters in edit mode, dashboard editors can set a default filter, applied when a user first opens the dashboard. Viewers can remove filter values to see unfiltered reports, but if no manual changes are made, they will view reports with the defined default filter.

To set a default filter, use the added filter options in the filter area. The configuration set during dashboard save becomes the default filter.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/edit-mode
