# MCP start event — Apply the template

1. Open your BPMN process in [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) or [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index).
2. Select a start event (or add a new one).
3. In the properties panel, click the element template picker.
4. Select **MCP start event** from the **AI Tools** category.


## Properties

| Property                  | Required | Description                                                                                                                                                                 |
| :------------------------ | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**                  | Yes      | The MCP tool identifier. Alphanumeric characters, hyphens (`-`), underscores (`_`), and dots (`.`) **only**. Maximum 100 characters. Used by MCP clients to call this tool. |
| **What it does**          | Yes      | A plain-language description of the process function. Shown to LLMs as tool metadata.                                                                                       |
| **Which inputs it needs** | Yes      | A plain-language description of required and optional input parameters, their types, and any constraints. Shown to LLMs as tool metadata.                                   |
| **When to use**           | No       | Specific situations or user intents that should trigger this tool.                                                                                                          |
| **When not to use**       | No       | Conditions or situations where this tool should not be invoked.                                                                                                             |
| **What the tool returns** | No       | The outcomes, results, and variable names the process produces on completion.                                                                                               |

A hidden `messageNameUuid` property is auto-generated and binds the start event to its BPMN message name. No user action is required for this property.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-start-event
