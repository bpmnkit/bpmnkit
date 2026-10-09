# Agentic control plane — Understand the metrics

The available metrics are grouped into four themes: key numbers, token usage, reliability and tool calls, and duration. Each one is described below, along with what it tells you and how to act on it.

**Info: Metric data scope**
The metrics only reflect completed process instances that used at least one [Camunda AI agent](https://docs.camunda.io/docs/next/reference/glossary#camunda-ai-agent).
This excludes both normal in-flight runs and agents stuck mid-execution, such as an agent hanging on a tool call. As a result, a hung agent won’t appear in **Incident rate** until its instance completes.
If a metric looks empty, there's usually no agentic data yet for the selected process or period.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/agentic-control-plane
