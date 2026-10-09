# Connect an external agent — Prerequisites

- An [Orchestration Cluster](https://docs.camunda.io/docs/next/components/orchestration-cluster) running Camunda 8.10 or later.
- An agent runtime that can act as a [job worker](https://docs.camunda.io/docs/next/components/concepts/job-workers) and call the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).
- An [authenticated API client](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication) with the `READ_PROCESS_INSTANCE` and `UPDATE_PROCESS_INSTANCE` authorizations on the process definition that contains the agent.


## Step 1: Mark the element as an external agent

Host the external agent on a [service task](https://docs.camunda.io/docs/next/components/modeler/bpmn/service-tasks/service-tasks) whose job type your runtime subscribes to, and add the `zeebe:agentDefinition` extension element with `agentType="external"`.

```xml
<bpmn:serviceTask id="research-agent" name="Research agent">
  <bpmn:extensionElements>
    <zeebe:agentDefinition agentType="external" />
    <zeebe:taskDefinition type="research-agent" />
  </bpmn:extensionElements>
</bpmn:serviceTask>
```

When you deploy the process, Camunda creates one agent definition for this element. The agent definition is bound to the process definition version, so redeploy the process after you add or change the marker.

See [mark an element as an agent](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances#mark-an-element-as-an-agent) for the other `agentType` values and the properties an agent definition holds.

### Package the setup as a custom element template

Camunda doesn't ship an external agent [element template](https://docs.camunda.io/docs/next/components/modeler/element-templates/about-templates), but you can create your own.

**Note: Create an element template**
This step is optional. The marker and job type added to the BPMN XML in the previous step are enough for Camunda to track the agent.
However, an element template avoids manual XML editing and keeps the configuration consistent when the same external agent is used across multiple processes.

The following template applies to a service task, fixes the job type your runtime subscribes to, and exposes the agent's prompt and result variable as configurable fields:

```json
{
  "$schema": "https://unpkg.com/@camunda/zeebe-element-templates-json-schema/resources/schema.json",
  "name": "Research agent",
  "id": "com.example.agents.research",
  "description": "An external research agent running on LangGraph.",
  "version": 1,
  "engines": {
    "camunda": "^8.10"
  },
  "appliesTo": ["bpmn:Task"],
  "elementType": {
    "value": "bpmn:ServiceTask"
  },
  "properties": [
    {
      "type": "Hidden",
      "value": "research-agent",
      "binding": {
        "type": "zeebe:taskDefinition",
        "property": "type"
      }
    },
    {
      "label": "Prompt",
      "type": "Text",
      "feel": "optional",
      "binding": {
        "type": "zeebe:input",
        "name": "prompt"
      }
    },
    {
      "label": "Result variable",
      "type": "String",
      "binding": {
        "type": "zeebe:output",
        "source": "= response"
      }
    }
  ]
}
```

See [defining templates](https://docs.camunda.io/docs/next/components/modeler/element-templates/defining-templates) for the full set of keys, and [template properties](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties) for the available bindings.

**Note**
Element templates configure properties through bindings. If a `zeebe:agentDefinition` binding isn't defined for your template, add the marker to the BPMN XML manually as shown in [step 1](#step-1-mark-the-element-as-an-external-agent), in addition to applying the template.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/connect-external-agent
