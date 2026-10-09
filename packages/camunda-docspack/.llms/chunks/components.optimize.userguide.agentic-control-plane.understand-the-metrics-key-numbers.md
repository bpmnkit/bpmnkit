# Agentic control plane — Understand the metrics — Key numbers

The top row gives you an at-a-glance health check, and each number carries a change badge comparing the current period to the previous one.

- **Total executions** counts the completed agentic executions in the period. It's your adoption and volume signal: a steady climb means agents are being used more, while an unexpected drop can mean a process has stalled. It also sets the scale for reading every other metric.
- **Average execution duration** shows the average end-to-end time of an agentic execution. If it trends upward, the experience is getting slower, and it's worth digging into the duration metrics or a specific process to find out why.
- **Incident rate** is the share of completed executions that hit and resolved an [incident](https://docs.camunda.io/docs/next/components/concepts/incidents), a quick reliability pulse. When it starts climbing, that's your cue to investigate. In the process view, **Failure rate by process version** helps you narrow down the cause.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/agentic-control-plane
