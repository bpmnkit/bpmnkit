# Build your first AI agent — Prerequisites

To build your first AI agent, see the prerequisites below depending on:

- Your working environment.
- Your chosen model.

### Camunda 8 environment

To run your agent, you must have Camunda 8 (version 8.8 or newer) running, using either:

- [Camunda 8 SaaS](https://docs.camunda.io/docs/next/components/saas/saas). For example, [sign up for a free SaaS trial account](https://accounts.cloud.camunda.io/signup).
- [Camunda 8 Self-Managed](https://docs.camunda.io/docs/next/self-managed/about-self-managed). For example, follow [run your first local project](https://docs.camunda.io/docs/next/guides/getting-started-example).

### Supported models

With the AI Agent connector, you can integrate frontier models from providers like Anthropic and Amazon Bedrock, or connect to open-weight models you host yourself on any OpenAI-compatible platform. See [supported model providers](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess#model-provider) for all options.

**Tip: Choose the right model setup**
Frontier models are billed per token. That works well for complex reasoning, but costs scale with volume. Self-hosted open-weight models use a fixed infrastructure cost instead, so routine decisions stay affordable as volume grows. Use a frontier model where nuanced judgment matters, and use a self-hosted model where decisions are simple and high-volume.

In this guide, you can try the following use cases:

| Setup                    | Model provider                                                                    | Model used                                             | Prerequisites                                                                                                                                                                                                                                                                                                                                                              |
| :----------------------- | :-------------------------------------------------------------------------------- | :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SaaS                     | [Camunda-provided LLM](https://docs.camunda.io/docs/next/components/agentic-orchestration/camunda-provided-llm) | Camunda-managed model (for example, Claude Sonnet 4.6) |  Camunda 8 SaaS trial or enterprise organization. Camunda-provided LLM available in your organization. No additional LLM provider credentials are required to run this guide.                                                                                                                                                     |
| Cloud (customer-managed) | AWS Bedrock                                                                       | Claude Sonnet 4                                        |  An AWS account with permissions for the [Bedrock Converse API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html). Anthropic Claude foundation models using the AWS console. See [AWS documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access-modify.html) for details. |
| Local                    | Ollama                                                                            | GPT-OSS:20b (any Ollama-supported model works)         |  [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run) running locally. Ollama and a model installed. See [set up Ollama](#set-up-ollama) for details.                                                                                                                                                          |

**Tip: Choose a lighter model if needed**
This guide uses GPT-OSS:20b as an example, but any model supported by Ollama works with the AI Agent connector. GPT-OSS:20b requires more than 20GB of RAM and 14GB of free disk space, which may be more than needed for this guide. Consider a smaller model (for example, `llama3.2` or `qwen2.5`) if your machine has limited resources.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-agentic-orchestration
