# LLM recommendations for agentic processes — Prompting recommendations — Use chain-of-thought and examples for complex tasks

Don’t hesitate to let the model “think out loud” or guide it through tricky scenarios. Chain-of-thought prompting asks the model to solve problems step by step, for example, by including a phrase like “Let’s reason this out step by step...” or using a hidden `<reflection>` tag if supported.
This approach helps improve reasoning accuracy.

Also, provide a few in-context examples (few-shot prompting) to show how to handle edge cases, compliance rules, or specific output formats. Illustrate any structured output formats in the prompt, and if possible, configure the connector's [response format](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent) options to enforce JSON or parsed text responses. Clear examples and format guidance set expectations for the AI, ensuring consistency and reducing errors.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/model-recommendations-agentic
