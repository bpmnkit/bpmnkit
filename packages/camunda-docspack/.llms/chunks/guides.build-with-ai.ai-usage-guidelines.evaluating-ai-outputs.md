# AI usage guidelines — Evaluating AI outputs

AI-generated outputs may be incorrect, incomplete, biased, or outdated. Always review outputs critically before acting on them, particularly in business-critical, legally relevant, or financially significant contexts.

In those contexts, consider implementing a [Human-in-the-Loop (HITL)](https://docs.camunda.io/docs/next/reference/glossary#human-in-the-loop-hitl) mechanism: a human review step before the output is acted upon.


## The AI models behind these features

Camunda's AI services integrate models from various sources. Here is what you need to know depending on your setup.

### Camunda-provided models

If Camunda offers its own AI model as part of an AI service and that model qualifies as a general-purpose AI (GPAI) model under the AI Act, Camunda provides it as a GPAI model without systemic risk unless Camunda notifies you otherwise.

### Fine-tuning and training

Where Camunda enables you to refine AI models through fine-tuning or other training methods, be aware that Camunda does not assume responsibility for the resulting model being classified as a GPAI model with systemic risk. Any obligations that arise from such a classification are yours to manage.

### Third-party models

If you train or modify a third-party model, you may become a "provider" of that model under the AI Act, with the compliance obligations that role entails.

---
Source: https://docs.camunda.io/docs/next/guides/build-with-ai/ai-usage-guidelines
