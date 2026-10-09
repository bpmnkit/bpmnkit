# Agent definitions and instances — Agent definitions — Mark an element as an agent

For Camunda to recognize an element as an agent, the element **must be marked** in the BPMN model with the `zeebe:agentDefinition` extension element.

For a [Camunda AI agent](https://docs.camunda.io/docs/next/reference/glossary#camunda-ai-agent), the AI Agent Sub-process and AI Agent Task element templates add the marker for you when you model in Camunda Modeler.

For an [external agent](https://docs.camunda.io/docs/next/reference/glossary#external-agent), Camunda doesn't ship an element template, so add the marker to the BPMN XML yourself. See [connect an external agent](https://docs.camunda.io/docs/next/components/agentic-orchestration/connect-external-agent) for the full setup, including how to package your agent as a custom element template.

**Info: Update element templates created before Camunda 8.10**
If you modeled the agent element before Camunda 8.10, update to the latest AI Agent Sub-process or AI Agent Task element template.

Open the process in Camunda Hub or Desktop Modeler, select the agent element, click **Update element template** in the properties panel to apply the latest template version, and redeploy the process.

#### Mark an element as an agent in XML

The marker is an extension element on the [ad-hoc sub-process](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses) or [service task](https://docs.camunda.io/docs/next/components/modeler/bpmn/service-tasks/service-tasks) that hosts the agent. Its `agentType` attribute declares the [agent type](#what-an-agent-definition-contains), and accepts `aiAgentSubProcess`, `aiAgentTask`, or `external`.

An AI Agent Sub-process marked as an agent:

```xml
<bpmn:adHocSubProcess id="research-agent" name="Research agent">
  <bpmn:extensionElements>
    <zeebe:agentDefinition agentType="aiAgentSubProcess" />
  </bpmn:extensionElements>
</bpmn:adHocSubProcess>
```

An external agent marked as an agent:

```xml
<bpmn:serviceTask id="research-agent" name="Research agent">
  <bpmn:extensionElements>
    <zeebe:agentDefinition agentType="external" />
  </bpmn:extensionElements>
</bpmn:serviceTask>
```

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances
