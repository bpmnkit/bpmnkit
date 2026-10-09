# Build your first AI agent — Step 1: Install the model blueprint

To start building your first AI agent, you can use a Camunda model blueprint from [Camunda Marketplace](https://marketplace.camunda.com/en-US/home).

In this guide, you will use the [AI Agent Chat Quick Start](https://marketplace.camunda.com/en-US/apps/587865) model blueprint.
Depending on your working environment, follow the corresponding steps below.

### saas

1. In the [blueprint page](https://marketplace.camunda.com/en-US/apps/587865), click **For SAAS** and select or create a project to save the blueprint.
1. The blueprint BPMN diagram opens in Camunda Hub.

### self-managed

1. In the [blueprint page](https://marketplace.camunda.com/en-US/apps/587865), click **For SM** and download the blueprint files from the repository.

**Note**
If you’re using Camunda 8 Run and installed it using the [starter package](https://docs.camunda.io/docs/next/guides/getting-started-example#download-the-getting-started-package), the blueprint was already downloaded as part of it.

2. Open the blueprint BPMN diagram in Desktop Modeler or [upload them to Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/import-diagram).

### About the example AI agent process

The example AI agent process is a chatbot that you can interact with via a [user task form](https://docs.camunda.io/docs/next/components/modeler/forms/camunda-forms-reference).

This process showcases how an AI agent can:

- **Make autonomous decisions** about which tasks to execute based on your input.
- **Adapt its behavior** dynamically using the context provided.
- **Handle complex scenarios** by selecting and combining different tools.
- **Integrate seamlessly** with other process components.

The example includes a form linked to the start event, allowing you to submit requests ranging from simple questions to more complex tasks, such as document uploads.

**Tip: Understand the decision model behind this example**
To make this agent reliable, treat each activity in the ad-hoc sub-process as a documented tool. Learn why this matters in [Design and architecture: Define your agent tools](https://docs.camunda.io/docs/next/components/agentic-orchestration/design-architecture#define-your-agent-tools).

For a runtime view of what the LLM decides vs. what Camunda orchestrates, see [Design and architecture: How execution works in an AI agent](https://docs.camunda.io/docs/next/components/agentic-orchestration/design-architecture#how-execution-works-in-an-ai-agent).

For prompt configuration details, see [AI Agent connector: System prompt, user prompt, and tool descriptions](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent#system-prompt-user-prompt-and-tool-descriptions).

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-agentic-orchestration
