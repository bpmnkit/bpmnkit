# Agentic control plane — Open the agentic control plane

1. Open **Optimize**.
2. In the navigation, select **Agentic Control Plane**.
3. The **Agentic Control Plane** page loads, showing metrics for all your agentic processes from the **last 30 days**.

**Note: SaaS trial clusters**
Optimize is disabled by default on new trial clusters. If the **Agentic Control Plane** tab doesn't appear in the navigation, an admin needs to enable Optimize first using the **Enable Optimize** prompt on the cluster overview. Upgrading from a trial to a paid plan enables Optimize automatically.


## Overview and process views

The **Agentic Control Plane** page has two views, controlled by the **Process** filter at the top:

- **Overview (default):** No process is selected, so you see every agentic process together. It covers every agentic process in the current Optimize instance (current cluster), not an organization-wide view across multiple clusters.
- **Process view:** Select one process (and optionally a **Version**). Every metric now describes just that process, including extra process-specific metrics.

To switch views, choose a process in the filter, or clear it to return to the overview.

**Note**
A process instance counts as agentic and is included in the metrics if it contains at least one execution of a [Camunda AI agent](https://docs.camunda.io/docs/next/reference/glossary#camunda-ai-agent), for example through the [AI Agent connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent).

Processes that call only [external agents](https://docs.camunda.io/docs/next/reference/glossary#external-agent) aren't tracked because the Camunda engine has no visibility into their execution.

### Filters

Use these filters to narrow the metrics down to the time window, process, or version you want to inspect:

- **Date range**: **Last 7 days**, **Last 30 days** (default), **Last 3 months**, **Last 6 months**, or **Last 12 months**. Dates are based on when each execution **completed**. Chart time buckets adjust automatically (for example, daily for a week, monthly for a year).
- **Process**: switches between the overview and the process view.
- **Version**: appears only in the process view. Focus on a specific process version, the latest, or all versions.

### Metrics available in each view

| Metric                               | Overview | Process view |
| ------------------------------------ | :------: | :----------: |
| Total executions                     |    ✅    |      ✅      |
| Average execution duration           |    ✅    |      ✅      |
| Incident rate                        |    ✅    |      ✅      |
| Average tokens per execution         |    ✅    |      ✅      |
| Median tokens per execution          |    ✅    |      ✅      |
| Token trend                          |    ✅    |      ✅      |
| Token outlier bands (P5 / P50 / P95) |    ✅    |      ✅      |
| Top token consumers by process       |    ✅    |      —       |
| Total tool calls                     |    ✅    |      ✅      |
| Failure rate by process version      |    —     |      ✅      |
| Tool calls per flow node (heatmap)   |    —     |      ✅      |
| P50 execution duration               |    ✅    |      ✅      |
| P95 execution duration               |    ✅    |      ✅      |
| Execution duration stability         |    ✅    |      ✅      |
| Duration per flow node (heatmap)     |    —     |      ✅      |

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/agentic-control-plane
