# Add long-term memory to your AI agents — Gate memory writes with human approval

Allowing an agent to write to its own knowledge database without human oversight can lead to incorrect
or irrelevant data being stored.

Besides, an effective pattern for building long-term memory is to combine a human escalation tool with runtime knowledge ingestion. When the agent can’t find an answer in the vector database, it escalates to a human. The human responds to the agent and decides whether it’s worth storing the answer in the vector database for future queries.

Over time, this creates a self-improving knowledge base: as humans answer previously unknown questions, the agent's ability to resolve those questions autonomously increases and the rate of human escalations decreases.

To implement this pattern:

1. Add a [user task](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks) inside the AI Agent's ad-hoc sub-process. The agent will invoke it as a tool when it cannot resolve a query from its existing knowledge.
2. Configure the user task's **Input mapping** to pass the agent's question to the form using `fromAi()`. For example:

```feel
fromAi(toolCall.question, "The question the agent needs a human to answer.")
```

3. Add a [form](https://docs.camunda.io/docs/next/components/modeler/forms/camunda-forms-reference) to the user task. It should capture the human's answer and include a decision checkbox for whether to store it in long-term memory.
4. Configure the user task's **Output mapping** to set the human's answer as `toolCallResult` so it is returned directly to the agent.
5. Add an [exclusive gateway](https://docs.camunda.io/docs/next/components/modeler/bpmn/exclusive-gateways/exclusive-gateways) after the user task with two outgoing paths:
   - **Approved**: [Store in the vector database](#store-in-the-vector-database).
   - **Rejected**: Do not store.
6. Use the human's output variable as the gateway condition.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/rag-ai-agents
