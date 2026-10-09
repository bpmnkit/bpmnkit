# Camunda-provided LLM — Supported models

Camunda-provided LLM uses a managed LLM gateway that supports multiple models from different providers. You can switch between models to compare how your agent performs with each one. When using the AI Agent connector, set the **Model** field to one of the following values:

| Model                       | Value to set in **Model**     | What it's good for                                                                                                                |
| :-------------------------- | :---------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| Amazon Nova Pro v1          | `amazon.nova-pro-v1`          | Best for balanced quality and cost across general-purpose AI agent scenarios.                                                     |
| Anthropic Claude Haiku 4.5  | `anthropic.claude-haiku-4-5`  | Best for lightweight assistants, short interactions, and lower-cost tasks that still need good instruction following.             |
| Anthropic Claude Opus 4.5   | `anthropic.claude-opus-4-5`   | Best for advanced analysis and challenging multi-step tasks where maximum quality is the priority.                                |
| Anthropic Claude Sonnet 4.6 | `anthropic.claude-sonnet-4-6` | Best as the default for complex agent tasks, balancing strong reasoning, reliable tool use, speed, and budget consumption.        |
| Anthropic Claude Sonnet 5   | `anthropic.claude-sonnet-5`   | Best for demanding agent tasks when you want stronger reasoning and tool use than the default and can trade off speed and budget. |
| DeepSeek v3.2               | `deepseek.v3.2`               | Best for technical and coding-heavy workflows that need strong reasoning at moderate cost.                                        |
| OpenAI GPT-OSS 120B         | `openai.gpt-oss-120b`         | Best for higher-quality results than small open models while still controlling cost.                                              |
| OpenAI GPT-OSS 20B          | `openai.gpt-oss-20b`          | Best for budget-conscious experimentation and simpler automations with lower complexity.                                          |
| Qwen Qwen3 235B             | `qwen.qwen3-235b`             | Best for advanced reasoning and coding use cases where you want strong performance with good cost efficiency.                     |

**Note**
When selecting a model, consider your process requirements, expected usage volume, and token budget. For model selection guidelines, see how to [choose the right LLM](https://docs.camunda.io/docs/next/components/agentic-orchestration/choose-right-model-agentic).

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/camunda-provided-llm
