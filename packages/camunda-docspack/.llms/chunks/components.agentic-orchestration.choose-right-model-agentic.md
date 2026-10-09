# Choose the right LLM

How to select the right LLM or foundation model for orchestrating agentic AI workflows.

Choose the right Large Language Model (LLM) to ensure your AI agent reliably executes tasks in a Camunda process.

This guide helps you evaluate and select the best LLMs based on your deployment requirements and business needs. It explains how to measure agent performance and shows how to leverage LiveBench’s standardized benchmarks to compare models effectively.


## Define your LLM needs

Consider the following aspects regarding your model requirements and setup constraints:

| Consideration             | Description                                                                                                                                                          |
| :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hosting**               | Cloud-only vs. on-premises deployment. For compliance-heavy or air-gapped environments, self-hostable open-source models are preferred.                              |
| **Data sensitivity**      | Workflows handling Personally Identifiable Information (PII) or confidential data may require private deployments or self-hosting to meet data control requirements. |
| **Cost vs. speed**        | Larger models offer higher accuracy but often with higher latency and cost. Balance performance against Service Level Agreements (SLAs) and budgets.                 |
| **Accuracy vs. openness** | Proprietary models often lead in benchmark accuracy. Open-source models provide flexibility, fine-tuning, and offline use cases.                                     |

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/choose-right-model-agentic
