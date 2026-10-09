# Camunda-provided LLM — Monitor usage

The Camunda-provided LLM budget is shared across your organization, so you should monitor consumption. Camunda Hub shows usage statistics for the Camunda-provided LLM, including:

- How much of your budget has been used.
- How much budget remains.

Use this data to plan your transition to a customer-managed provider when you're ready for production.


## Switch away from Camunda-provided LLM

As you move from evaluation to production, you may want to switch to your own LLM provider. This gives you:

- Direct control over provider choice.
- Your own billing and quota management.
- The ability to scale beyond the Camunda-provided LLM budget caps.

**Important: Before you begin**

- Ensure your organization has access to the LLM provider you plan to use.
- Gather credentials and any required configuration.
- Identify where your current AI agent models rely on Camunda-provided LLM defaults.

To switch away, follow these steps:

1. Add your LLM provider credentials in the appropriate Camunda location for managing secrets and credentials.
2. Update your AI Agent connector configuration to use the new LLM provider.
3. Re-deploy your process.
4. Test a process instance end-to-end and verify results.

Your orchestration model doesn’t change during this transition. The BPMN process, event choreography, and human touchpoints you designed with Camunda-provided LLM carry forward unchanged, while only the LLM backend configuration shifts.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/camunda-provided-llm
