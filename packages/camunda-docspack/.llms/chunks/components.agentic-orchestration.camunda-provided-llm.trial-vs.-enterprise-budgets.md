# Camunda-provided LLM — Trial vs. enterprise budgets

The budgets, measured in **dollars (USD) spent**, differ depending on your SaaS plan:

- **Trial**: A smaller budget intended for quick evaluation and early experiments by individuals and small teams.
- **Enterprise**: A larger budget intended for broader team experimentation and proofs of concept.

**Important**
Budgets are topped up automatically and enforced at the organization level (not per user). This means multiple users in the same organization draw from the same budget.

### What the budget covers

The Camunda-provided LLM budget covers LLM provider calls during AI agent execution:

- **Trial budget**: Allows for a hundred to a few thousand agent runs, depending on the model used and the agent complexity.
- **Enterprise budget**: Is significantly larger to support more extensive experimentation.

Other Camunda AI features, such as Camunda Copilot, do not consume your Camunda-provided LLM budget and can be used independently.

**Note**
The total cost of an agent run depends on how many LLM calls it makes, which can vary based on the agent’s design and task complexity. Cost also depends on the model used, since different models have different per-token pricing.

### When budget is exhausted

When your organization reaches its Camunda-provided LLM budget cap:

- Additional LLM calls are **blocked**.
- Your process execution may fail with an “out of budget” error, such as `COST_LIMIT_EXCEEDED`, depending on how your process handles errors.

**Tip**
If your process model doesn’t handle LLM failures, an exhausted budget may result in incidents or failed instances. Consider adding BPMN error handling to provide a user-friendly fallback path.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/camunda-provided-llm
