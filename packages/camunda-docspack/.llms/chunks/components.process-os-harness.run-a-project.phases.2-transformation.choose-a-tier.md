# Transform the process to a to-be design — Choose a tier

A full run always includes the incremental tier, then asks whether to also run the radical and moonshot tiers. Results land in `transformation/` and `transformation-analysis/`, with optional BPMN in `transformation/bpmn/`.

| Tier          | What it proposes                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `migration`   | Lift and shift. Carries the as-is process into executable form without changing it.                 |
| `incremental` | Safe automation. A deterministic optimization pass that always runs as part of a to-be exploration. |
| `radical`     | A redesign that challenges organizational boundaries.                                               |
| `moonshot`    | An agent-first design with almost no user tasks.                                                    |

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/run-a-project/phases/2-transformation
