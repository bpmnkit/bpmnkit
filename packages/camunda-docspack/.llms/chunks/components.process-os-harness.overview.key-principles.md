# ProcessOS Harness — Key principles

#### A governance process guides the journey

ProcessOS Harness runs your engagement as a governed process with defined phases and milestones. You keep full flexibility between milestones, but the milestones themselves ensure the project progresses.

| Phase     | Goal                                                                            |
| --------- | ------------------------------------------------------------------------------- |
| Scope     | Define the scope of the process to re-engineer.                                 |
| Discover  | Discover the as-is process from organizational memory, and fill gaps with SMEs. |
| Transform | Transform the as-is process into an agentic to-be process.                      |
| Implement | Generate and implement the executable Camunda solution.                         |

Each phase ends at a milestone: process scope defined, as-is model finalized, to-be models finalized, and solution ready for production. Between milestones, [SME review cycles](https://docs.camunda.io/docs/next/components/process-os-harness/run-a-project/review-cycle) act as gates that validate progress before the project moves on.

The governance process itself runs on Camunda. Project state lives in Camunda and every artifact is committed to Git, so the whole engagement is auditable. For details, see [how the governance process works](https://docs.camunda.io/docs/next/components/process-os-harness/run-a-project/governance-process).

#### Progress comes from iterations and your judgment

AI isn't deterministic, so ProcessOS Harness doesn't produce a finished solution in a single pass. Project maturity rises through iterations across discovery, transformation, and implementation, and thinking in iterations is the skill that matters most.

Your expert judgment is what turns agent output into a working system. ProcessOS Harness generates artifacts and runs tests, but you assess each result and confirm when it is ready to carry into the next phase. Plan for review, correction, and another iteration rather than for a single hand-off.

The AI coding agent supports you throughout. You can ask it to fix problems at any point, including working around defects you hit along the way.

#### Two supported use cases

ProcessOS Harness runs all phases for both use cases, but uses different modes within them.

| Use case          | What it does                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| Legacy migration  | Transforms processes running on a legacy system to Camunda 8, as a first step before AI transformation. |
| AI transformation | Transforms any process into an automated, AI-native process executable on Camunda 8.                    |

Legacy migration transformations can be optimized for specific source systems. Get in contact with Camunda to learn more.

---
Source: https://docs.camunda.io/docs/next/components/process-os-harness/overview
