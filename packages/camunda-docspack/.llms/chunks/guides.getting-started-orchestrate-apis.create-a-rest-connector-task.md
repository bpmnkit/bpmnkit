# Get started with API orchestration — Create a REST connector task

To use a REST connector in your process, follow the steps below:

1. In Camunda Hub, open a [workspace](https://docs.camunda.io/docs/next/components/hub/workspace/index).
2. Create a new project.
3. In the project, click **Create new > BPMN diagram**.
4. With your new diagram open, make sure you're in [**Implement** mode](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/collaboration/implement-your-process).
5. With no diagram elements selected, open the **Details** panel on the right side of the modeling interface.
6. Under **Properties > General**, configure the following properties:
   - **Name:** `API Orchestration Tutorial`
   - **ID:** `api-orchestration-tutorial`
7. Click the existing start event, then select the **Append task** icon.
8. Click the new task, then select the **Change element** icon.
9. Search for and select the **REST Outbound Connector**.
10. With the **REST Outbound Connector** selected, under **Properties > General**, name the task `Make a request`.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-apis
