# Build your first AI agent — Step 2: Configure the AI Agent connector — self-managed

Export the secrets as environment variables before starting the distribution.
See [Connector secrets](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#secrets) for details.

See [Amazon Bedrock model provider](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess#amazon-bedrock) for more information about other available authentication methods.

#### Configure properties

In the blueprint BPMN diagram, the AI agent is implemented using the [AI Agent Sub-process connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess).

You can keep the default configuration or adjust it to test other setups. To do so, use the properties panel:

**Tip**
When configuring connectors, use [FEEL expressions](https://docs.camunda.io/docs/next/components/modeler/feel/language-guide/feel-expressions-introduction), by clicking the `fx` icon, to reference [process variables](https://docs.camunda.io/docs/next/reference/glossary#process-variable) and create dynamic prompts based on runtime data.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-agentic-orchestration
