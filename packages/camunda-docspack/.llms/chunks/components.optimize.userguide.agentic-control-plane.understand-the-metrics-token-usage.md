# Agentic control plane — Understand the metrics — Token usage

Tokens are the units of AI model usage, so this group is effectively about cost.

- **Average tokens per execution** captures the typical cost of a single run as the combined input and output tokens. When it grows while your execution volume stays flat, prompts or responses are expanding, which is a good moment to review your prompt design.
- **Median tokens per execution** is the midpoint: half of executions use less, half use more. Because it ignores extreme outliers, it represents the typical run. Compare it against the average: a large gap means a handful of very expensive runs are inflating your costs, so it's worth hunting down those outliers.
- **Token trend** plots input tokens against output tokens over time. It reveals where cost growth comes from: bigger prompts push up the input line, longer responses push up the output line. If tokens rise without more executions, your prompts may be growing, or the model may be producing longer answers, which is worth raising with engineering.
- **Token outlier bands (P5 / P50 / P95)** show the spread of per-execution token usage over time, from low to typical to high. A widening gap between the P5 and P95 bands means executions are behaving inconsistently, often a sign of prompt variability or non-determinism.
- **Top token consumers by process** ranks your processes by total token spend, showing the top 10 as a bar chart. This is where you see where the money goes across all processes: cutting the top consumer has the biggest impact on overall spend, and you can select that process to drill into it in the process view. A **Top X of Y** note appears when more processes exist beyond those shown.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/agentic-control-plane
