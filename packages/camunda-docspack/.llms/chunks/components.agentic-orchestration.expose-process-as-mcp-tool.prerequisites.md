# Expose a process as an MCP tool — Prerequisites

- A [Camunda Hub project](https://docs.camunda.io/docs/next/components/hub/workspace/manage-projects/create-a-project) or access to [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/install-the-modeler).
- An [Orchestration Cluster](https://docs.camunda.io/docs/next/components/orchestration-cluster) running Camunda 8.10 or later.


## Step 1: Add an MCP start event to your process

The [MCP start event element template](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-start-event) is an element template that you apply to a BPMN message start event. When deployed, it registers the process as an MCP tool.

1. Open your BPMN process in [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/model-your-first-diagram) or Desktop Modeler.
2. Select the start event (or add a new one).
3. In the properties panel, click the element template picker and select **MCP start event** from the **AI Tools** category.

![A BPMN message start event in the Camunda Hub modeler with the MCP start event element template applied, showing the properties panel](img/mcp-start-event-modeler.png)

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/expose-process-as-mcp-tool
