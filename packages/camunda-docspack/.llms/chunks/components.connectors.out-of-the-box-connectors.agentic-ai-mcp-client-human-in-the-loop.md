# Human in the loop

Learn how to build human-in-the-loop AI workflows by combining MCP with BPMN.

Learn how to build human-in-the-loop AI workflows in Camunda by combining MCP Client tool discovery with BPMN elements like gateways, intermediate events, and user tasks to control and approve tool execution.


## About

Using [tool discovery](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-tool-discovery), you can combine the MCP Client connector with other BPMN elements, such as user tasks or intermediate events, to create a human-in-the-loop interaction.

Instead of directly exposing the MCP Client connector as a tool, an intermediate event marked as an MCP client gateway can serve as the root activity of a tool flow within the ad-hoc sub-process.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-human-in-the-loop
