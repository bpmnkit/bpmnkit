# Choose the right LLM — Benchmark your candidate models

Once you have defined your model needs, setup requirements, and peformance metrics, standardized benchmarks help you measure these aspects objectively.
They use the same tasks and conditions for every model, enabling fair comparisons.

### Learn about LiveBench metrics

One such benchmark is ​​[LiveBench](https://arxiv.org/abs/2406.19314), that evaluates LLMs across multiple skill areas.
It avoids common pitfalls such as test data contamination or subjective scoring by using fresh tasks and objective ground-truth answers.

Each LiveBench metric represents a core capability:

| Metric                             | What it measures                                         | When it matters                                   |
| :--------------------------------- | :------------------------------------------------------- | :------------------------------------------------ |
| **Reasoning**                      | Logical thinking and stepwise problem-solving.           | Strategic planning, multi-step workflows.         |
| **Math**                           | Numerical accuracy and quantitative reasoning.           | Finance, analytics, reporting.                    |
| **Coding**                         | Code generation and debugging.                           | Dev tools, automation scripts.                    |
| **Data analysis**                  | Extracting insights from datasets, tables, or documents. | Research, reporting, content analysis.            |
| **Instruction following**          | Compliance with formats, rules, and prompts.             | Policy-driven workflows, SOP tasks.               |
| **Software engineering (agentic)** | Tool-assisted coding and autonomous dev work.            | CI/CD, issue triage, automated PRs.               |
| **Language**                       | Context understanding, fluency, general knowledge.       | Chatbots, documentation, natural language output. |

Different models excel in different areas.
For instance, a model might rank highly in reasoning but score average on coding tasks.
Matching model strengths to your workflow requirements ensures better outcomes.

### Compare models with LiveBench

Use the interactive tool below to generate a LiveBench benchmark comparison.
It outputs a pre-filtered table based on your selected criteria.

**Note**

- LiveBench benchmarks are used under a Creative Commons license.
- [LiveBench rankings](https://livebench.ai/#/) update continuously. The table above shows the most recent evaluation results.
- This tool is provided for illustration purposes only to help you choose the right LLM for your agentic processes.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/choose-right-model-agentic
