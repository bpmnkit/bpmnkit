# Design and architecture

Plan and design your agentic orchestration solutions, and understand recommended architecture and workflow guidelines.

Plan and design your agentic orchestration solutions, and understand recommended architecture guidelines.


## Plan agentic orchestration solutions

Follow these principles when planning your agentic orchestration solution:

- **Problem first**: First, identify any problem you might have in a process, and only then determine whether an AI agent could help solve the problem. Do not use an AI agent where it is not really necessary, or just for the sake of it.
- **Architect for composability**. Avoid becoming too dependant on a specific LLM model, for example by doing too much fine tuning. This allows you to more easily integrate newer LLM providers and models in the future that better suit your needs.
- **Observability and governance**: Use [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction) and [Optimize](https://docs.camunda.io/docs/next/components/optimize/what-is-optimize) for visibility into your agentic orchestration processes.

### Blend deterministic and dynamic orchestration

Blending both deterministic and dynamic (AI-driven) process orchestration into your end-to-end processes allows you to take advantage of non-deterministic process orchestration without sacrificing predictability, customer experience, and compliance.

For example, you could use an AI agent to enhance a Know Your Customer (KYC) process, where the AI agent:

- Provides dynamic guidance and problem-solving to the person throughout the process.
- Monitors for policy changes and dynamically changes the process execution in response.
- Automatically adjusts risk level and takes action such as restricting account activity or dynamically adjusting spend limits.

### When to use deterministic or non-deterministic orchestration

Agentic orchestration involves blending both deterministic and dynamic (AI-driven) process orchestration into your end-to-end processes. It is important to understand when to use each approach:

| &nbsp;           | Deterministic                                                                                                                                                                                                | Dynamic                                                                                                                                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Suitable for** | Clear, predictable paths.Repeatable, rules-based decisions.Fast, efficient execution.Regulation dictates execution sequence. | Flexible, context-aware choices.AI-driven task planning.Unstructured cases: classification, triage, or investigation.Adaptable to data and conditions. |
| **Enabled by**   | Advanced workflow patterns.Business/IT alignment on process and decision logic.                                                                              | Dynamic task scheduling and tracking.Collaboration between AI and Human.                                                                                                               |

**Info**
To learn more about determining when and where to use AI agents within your automation strategy, download the [why agentic process orchestration belongs in your automation](https://page.camunda.com/wp-why-agentic-process-orchestration-belongs-in-your-automation-strategy) strategy guide.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/design-architecture
