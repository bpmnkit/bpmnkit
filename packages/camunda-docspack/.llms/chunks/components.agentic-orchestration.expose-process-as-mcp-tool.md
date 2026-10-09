# Expose a process as an MCP tool

Expose BPMN processes as MCP tools so AI agents can discover, invoke, and run Camunda workflows through the Processes MCP Server.

Expose a BPMN process as a callable [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) tool so that AI agents and LLM-powered applications can discover and invoke it.


## About

You can configure a BPMN process as a callable MCP tool through the [Processes MCP Server](https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-overview).

It is built into the Orchestration Cluster and automatically registers processes as MCP tools when they are deployed with the [MCP start event element template](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-start-event).

**Tip**
If your AI agent and the target process run on the **same** Orchestration Cluster, consider using a [call activity](https://docs.camunda.io/docs/next/components/modeler/bpmn/call-activities/call-activities) inside the ad-hoc sub-process instead. Call activities are synchronous and maintain a connected instance hierarchy with a consistent audit trail. See [call processes as agent tools](https://docs.camunda.io/docs/next/components/agentic-orchestration/design-architecture#call-processes-as-agent-tools) for a full comparison.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/expose-process-as-mcp-tool
