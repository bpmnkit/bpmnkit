# Camunda-provided LLM — Supported models

Camunda-provided LLM uses a managed LLM gateway that supports the models listed below. You can switch between these models to compare how your agent performs with each one. When using the AI Agent connector, set the **Model** field to one of the following values:

| Model                                                                            | Value to set in **Model**     | What it's good for                                                                                                         |
| :------------------------------------------------------------------------------- | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| [Anthropic Claude Sonnet 4.6](https://openrouter.ai/anthropic/claude-sonnet-4.6) | `anthropic/claude-sonnet-4.6` | Best as the default for complex agent tasks, balancing strong reasoning, reliable tool use, speed, and budget consumption. |
| [Anthropic Claude Haiku 4.5](https://openrouter.ai/anthropic/claude-haiku-4.5)   | `anthropic/claude-haiku-4.5`  | Best for lightweight assistants, short interactions, and lower-cost tasks that still need good instruction following.      |

**Note**
When selecting a model, consider your process requirements, expected usage volume, and token budget. For model selection guidelines, see how to [choose the right LLM](https://docs.camunda.io/docs/next/components/agentic-orchestration/choose-right-model-agentic).

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/camunda-provided-llm
