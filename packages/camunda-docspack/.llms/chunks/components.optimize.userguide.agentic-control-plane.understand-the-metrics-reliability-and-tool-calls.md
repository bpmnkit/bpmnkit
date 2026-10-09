# Agentic control plane — Understand the metrics — Reliability and tool calls

- **Total tool calls** is the total number of tool or action calls your agents made, a gauge of how much work they delegate to tools. Sudden changes can point to a behavior shift or a looping agent, so it's useful to read alongside token usage and duration.
- **Failure rate by process version** breaks the failure percentage down by process definition version. It answers whether a specific version is more or less reliable, so you can confirm whether a new release improved or regressed things and decide whether to roll it back or promote it.
- **Tool calls per flow node** overlays a heatmap on the process diagram, coloring each step by how many tool calls it triggers. It pinpoints where in the process your agents do the most work, so you can target the hottest steps for review, such as a tool an agent calls far more often than expected.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/agentic-control-plane
