# Assess business value — Review the portfolio view

The portfolio view summarizes all processes in the selected cluster. Use it to see where targets are met and which processes need attention.

![Business value dashboard portfolio view with target overview, activity, automation rate, cycle time, agentic adoption, and off-target processes](img/business-value-dashboard-portfolio-view.png)

| Metric                         | What it shows                                                                                                      | How to interpret it                                                                        |
| :----------------------------- | :----------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| Target coverage and attainment | How many active processes have at least one target set, and how many configured targets are currently met.         | Low coverage means the summary reflects only a subset of your processes.                   |
| Activity                       | Completed work handled and how it changes over time.                                                               | Use activity as context for the other metrics. Activity isn't compared against a target.   |
| Automation rate                | The aggregated automation rate for the cluster, plus a per-process comparison.                                     | Use it to find processes that still rely heavily on manual work.                           |
| Cycle time                     | A process-by-process comparison and the longest-running processes.                                                 | Use it to find where processes take longest to complete.                                   |
| Agentic adoption               | Which processes use [agentic](https://docs.camunda.io/docs/next/components/agentic-orchestration/agentic-orchestration-overview) steps.          | Use it to see where AI agents already handle part of the work.                             |
| Off-target processes           | Processes with missed targets, ranked first by the number of missed targets and then by the size of the deviation. | Start with the top entry. See [investigate a missed target](#investigate-a-missed-target). |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/analyze-operations/business-value-dashboard
