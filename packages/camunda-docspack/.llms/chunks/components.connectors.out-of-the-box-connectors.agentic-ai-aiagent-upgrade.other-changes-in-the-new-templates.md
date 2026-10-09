# Upgrade AI Agent element templates — Other changes in the new templates

### Agent definition

The new templates mark the element as an agent with the `zeebe:agentDefinition` extension element, so Camunda recognizes it as an [agent definition](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances). The template writes this element when you apply it, and you don't need to configure it.

### Job type overrides

If you [override the AI Agent job types](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-customization) with environment variables, for example in a hybrid setup, the legacy variables don't apply to the new job types. The legacy and new job workers are registered separately, so each variable only affects its own job worker. Set the new variables to use your custom type with the new templates:

| Element              | Legacy variable                      | New variable                         |
| :------------------- | :----------------------------------- | :----------------------------------- |
| AI Agent Task        | `CONNECTOR_AI_AGENT_TYPE`            | `CONNECTOR_AI_AGENT_TASK_TYPE`       |
| AI Agent Sub-process | `CONNECTOR_AI_AGENT_JOB_WORKER_TYPE` | `CONNECTOR_AI_AGENT_SUBPROCESS_TYPE` |

The element template must reference the same custom job type. Keep the legacy variables set for as long as process definitions that use the legacy templates are deployed or running.

### AI Agent Task: tools sub-process {#ai-agent-task-tools-sub-process}

The AI Agent Sub-process template configures its own ad-hoc sub-process. The AI Agent Task is a service task that references a separate ad-hoc sub-process containing the tools, and the new AI Agent Task template does not manage that sub-process. After you apply the new template to an AI Agent Task, update the tools sub-process manually:

1. Mark the ad-hoc sub-process as a tool container. Open the **Extension properties** section of the sub-process and add a property named `io.camunda.agenticai.toolContainer` with the value `true`. See [declare a sub-process as agentic](https://docs.camunda.io/docs/next/components/modeler/reference/modeling-guidance/rules/agent-fromai-contract#declare-a-sub-process-as-agentic). Without this property, the Modeler's agent tool configuration features, such as linting and autofill, are not available for the sub-process.
2. Add `completedAt: now()` to the **Output element** of the sub-process' multi-instance configuration:

   ```feel
   {
     id: toolCall._meta.id,
     name: toolCall._meta.name,
     content: toolCallResult,
     completedAt: now()
   }
   ```

   The agent uses `completedAt` as the time the tool call completed. If it is missing, the AI Agent connector uses the time at which it processes the tool call results instead, which can be later than the actual completion time for slow or parallel tool calls.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-upgrade
