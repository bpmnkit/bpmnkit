# Camunda-provided LLM — Set up Camunda-provided LLM

Once Camunda-provided LLM is available in your organization, its credentials are populated automatically as [SaaS-managed secrets](https://docs.camunda.io/docs/next/reference/glossary#saas-managed-secret).

- If you are using an AI agent blueprint, no additional configuration is needed in most cases. Explore selected AI agent blueprints in the [Camunda Marketplace](https://marketplace.camunda.com/en-US/home).
- If you are building your own agent from scratch, enable Camunda-provided LLM by configuring your [AI Agent connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent) with the following parameters:
  - **Provider**: `OpenAI Compatible`.
  - **API endpoint**: `{{secrets.CAMUNDA_PROVIDED_LLM_API_ENDPOINT}}`.
  - **API key**: `{{secrets.CAMUNDA_PROVIDED_LLM_API_KEY}}`.
  - **Model**: Select a model from the [list of supported models](#supported-models). For example, `anthropic/claude-sonnet-4.6`.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/camunda-provided-llm
