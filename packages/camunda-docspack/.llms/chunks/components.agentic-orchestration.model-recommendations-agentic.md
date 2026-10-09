# LLM recommendations for agentic processes

Recommendations and best practices for choosing LLMs and designing effective prompts for agentic processes.

Recommendations and best practices for choosing LLMs and designing effective prompts for agentic processes.


## General model requirements

To implement an agentic process, you must choose a model that meets certain baseline requirements.
These include:

### Tool calling support

The model should be able to invoke external tools and work with work with tool-calling mechanisms, as part of its output.
If a model cannot call tools, it won’t be suitable for an agentic workflow.

### Vendor compatibility

The model must be available through at least one supported vendor or API.

In practice, this means using a model from AWS Bedrock, Google Vertex AI, Azure OpenAI, OpenAI (or any platform compatible with the OpenAI API).
Choosing a model from these ecosystems ensures it will integrate with Camunda’s connectors and the agentic orchestration framework.

### Plain text I/O

The model should accept and return plain text.

Agentic processes rely on text prompts and text-based replies (which may include JSON or other structured text). Avoid models that only produce non-text outputs or require special input formats. _Text in, text out_ is essential for simplicity and reliable tool integration.

### Choose the right model for each use case

Not every decision in a process needs the same model:

- Frontier models deliver stronger reasoning and handle ambiguous inputs well, but carry higher per-call costs and depend on external infrastructure.
- Open-weight models, hosted via Ollama or a compatible inference platform, offer lower costs and full infrastructure control. They're a good fit for high-volume or simpler decisions.

With the right model choice, you can keep accuracy where it counts and control costs everywhere else.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/model-recommendations-agentic
