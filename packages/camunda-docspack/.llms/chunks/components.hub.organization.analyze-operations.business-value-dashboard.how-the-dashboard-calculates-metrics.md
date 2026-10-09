# Assess business value — How the dashboard calculates metrics

Every metric on the dashboard follows the same rules.

| Rule                       | What it means                                                                                                                                |
| :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| Completed instances only   | Only completed process instances are counted. Running and unfinished instances are excluded from every metric, chart, and target comparison. |
| Targets are values you set | Camunda doesn't supply a default or benchmark target. Every target on the dashboard is one you entered.                                      |

### Automation rate definition

Automation rate is the share of counted tasks that are automated. It is calculated as `automated tasks / (automated tasks + user tasks + manual tasks)`.

| Included                                                                                  | Excluded                                      |
| :---------------------------------------------------------------------------------------- | :-------------------------------------------- |
| Automated tasks, such as service tasks, script tasks, business rule tasks, and send tasks | Events and gateways                           |
| User tasks and manual tasks, which count toward the denominator                           | Sub-process containers themselves             |
| Tasks inside embedded sub-processes, counted the same as tasks at the top level           | Tasks in a process started by a call activity |

Structural elements are excluded because the automation rate counts tasks rather than events, gateways, or sub-process containers. A process built mostly from gateways and events is not automatically 100% automated under this definition.

Automation rate is calculated on the root process only. Tasks in a process started by a call activity count toward the automation rate of that called process, not the calling one.

### Cycle time definition

Cycle time is the elapsed duration of a completed process instance, from start to end.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/analyze-operations/business-value-dashboard
