# User task analytics — Features

![user features example 1](./img/userTask_features1.png)
![user features example 2](./img/userTask_features2.png)

To evaluate user tasks, the following features are available in the report builder:

- **View user task** - The `View: User task` option limits the flow nodes evaluated to user tasks only.
- **Duration aggregations** - Durations can be aggregated by `Total`, `Assigned` and `Unassigned`.
- **Grouping** - Data can be grouped by `User tasks` or `Assignee`.
- **Filter** - Data can be filtered by `Assignee`.


## Good to know

**Danger: Known limitations**

- Currently, user task analytics can be used only with assigned or unassigned time. We are working on analyzing net-work time.
- This will only work with Tasklist and custom task applications implementing the complete [Camunda Tasklist Lifecycle](https://docs.camunda.io/docs/next/apis-tools/frontend-development/01-task-applications/01-introduction-to-task-applications).
- User task analytics only work correctly if all user tasks in a process are of type `Camunda user task` (formerly Zeebe user task). The `job worker` user type does not contain task lifecycle information and is therefore not displayed in the `User tasks` view.

### How to evaluate task performance per assignee

Evaluating performance on assignee level is not allowed in all organizations. All features related to data evaluation on an assignee level can be deactivated via [configuration](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration-platform-8#settings-related-to-camunda-8-zeebe-user-tasks).

Evaluation on assignee level is only possible in Camunda 7 and Camunda 8 Self-Managed.

### How the user task duration time is calculated

In user task duration reports, you have the opportunity to select which part of the user task's lifecycle you want to see in the report:

- **Unassigned:** View how long each user task was considered unassigned (not claimed by an assignee/user) during its execution.
- **Assigned:** View how long each user task was considered to be assigned to assignees/users (claimed by an assignee/user) during its execution.
- **Total:** View how long each user task took to complete.

It is possible to display and compare multiple user task duration times in the same report. Reports with multiple user task duration times that have a [second "Group by"](https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/report-analysis/define-reports#reports-with-a-second-group-by-option) can only be visualized as table.

In certain circumstances, user tasks can be completed without being assigned to a user. These user tasks are evaluated as follows:

- If the user task was canceled without assignment (for example, by an Operator in Operate), the task duration is considered `Unassigned`.
- If the user tasks were completed without assignment (for example, via a custom UI), the time between start and end is considered `Assigned`.
- As these user tasks do not have an `assignee` set, they are displayed `Unassigned` in the reports.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/user-task-analytics
