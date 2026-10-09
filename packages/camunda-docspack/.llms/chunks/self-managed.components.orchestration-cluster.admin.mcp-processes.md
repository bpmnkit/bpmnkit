# MCP processes

Monitor which processes are registered as MCP tools in the Orchestration Cluster admin UI.

The Orchestration Cluster admin UI provides an overview of the processes currently registered as MCP tools in the [Processes MCP Server](https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-overview).


## View registered MCP processes

Navigate to **MCP Processes** in the Orchestration Cluster admin UI to see all processes currently exposed as MCP tools.

![Admin UI page listing processes registered as MCP tools, showing tool name, tool description, process name, version, and tenant](img/mcp-tools-admin.png)

The following information is displayed for each registered process:

| Column               | Description                                                                                       |
| :------------------- | :------------------------------------------------------------------------------------------------ |
| **Tool name**        | The MCP tool identifier configured in the MCP start event element template.                       |
| **Tool Description** | The plain-language description of the tool's function, as configured in the MCP start event.      |
| **Process Name**     | The name of the BPMN process registered as an MCP tool.                                           |
| **Version**          | The process definition version currently registered. Only the latest deployed version is exposed. |
| **Tenant**           | The tenant the process belongs to.                                                                |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/mcp-processes
