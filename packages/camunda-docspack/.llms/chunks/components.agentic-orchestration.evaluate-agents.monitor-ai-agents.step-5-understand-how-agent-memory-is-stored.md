# Monitor your AI agents with Operate — Step 5: Understand how agent memory is stored

In [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) or Desktop Modeler, within the AI Agent sub-process, you can define how the conversation memory is stored using the **Memory storage type** field.

By default, agent memory uses the **In Process** type, which stores it as part of the agent context, the same underlying data the conversation history in [step 4](#step-4-review-the-conversation-history) is built from.

Other available options include **Camunda Document Storage**, **AWS AgentCore Memory**, and a custom implementation. See [memory](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess#memory) for more details.

**Note: Advanced: inspect the raw agent context**
For a Camunda AI agent, this data is stored in the `agentContext` process variable. Open the element's **Variables** tab to inspect it directly, for example to check a runtime artifact not surfaced in the conversation history. See [agent context and memory](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances#agent-context-and-memory) for how it's structured.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/evaluate-agents/monitor-ai-agents
