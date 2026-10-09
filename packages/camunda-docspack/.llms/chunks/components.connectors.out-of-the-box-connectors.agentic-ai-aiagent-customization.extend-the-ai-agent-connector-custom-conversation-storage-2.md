# Customize the AI Agent connector — Extend the AI Agent connector — Custom conversation storage (2)

**Note: Storage contract**
`storeMessages` must always write to a **new** record (or document, or branch) and return a `ConversationContext` pointing to it.

Never mutate or overwrite the data the previous context points at. If job completion fails, Zeebe retries with the old `AgentContext` (and therefore the old cursor); the old pointer must still resolve to the old data. The newly written record becomes an orphan, which the `onJobCompletionFailed` hook can clean up.

See the [storage contract reference](https://github.com/camunda/connectors/blob/main/connectors/agentic-ai/docs/reference/ai-agent.md#storage-contract) for the full rules every implementation must follow.

After implementing the custom store, you can reference the store type in your AI Agent connector configuration (see [memory configuration](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent#memory)):

1. In the **Memory** group of the AI Agent connector properties, set the **Memory storage type** to **Custom implementation**.
2. In the **Implementation type** field, enter the type value of your custom store implementation (`my-conversation` in the example above).
3. Run your process model. It should now use your custom conversation store for storing the conversation history.

**Info**
An incident is raised if the AI Agent connector is not able to find a conversation store implementation for the specified type.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-customization
