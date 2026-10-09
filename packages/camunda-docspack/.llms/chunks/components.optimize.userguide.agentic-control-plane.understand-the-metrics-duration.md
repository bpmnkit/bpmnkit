# Agentic control plane — Understand the metrics — Duration

- **P50 execution duration** is the median execution time: half of runs finish faster, half slower. It gives you the typical performance experience and a stable baseline to compare against P95 and over time.
- **P95 execution duration** exposes the slow tail: 95% of executions finish within this time. It surfaces worst-case slowness that averages tend to hide. When P95 sits far above P50, a meaningful minority of runs are slow, and those are the cases worth investigating.
- **Execution duration stability (P50 / P95)** plots both the median and 95th-percentile duration over time on a single chart. It shows whether performance is steady or drifting, helping you catch gradual degradation, or a widening gap between typical and worst-case runs, before users start to complain.
- **Duration per flow node** overlays a heatmap on the process diagram, coloring each step by its average duration. It shows which steps consume the most time so you can focus performance work on the true bottlenecks. Like the other heatmap, it's only available in the process view.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/agentic-control-plane
