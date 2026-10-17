# Version binding

Understand how the Processes MCP Server handles process version binding, stale tool references after redeployment, and best practices for managing breaking changes.

Understand how the Processes MCP Server handles process version binding, stale tool references after redeployment, and best practices for managing breaking changes.


## Which version is exposed

The Processes MCP Server always exposes only the **latest deployed version** of a process. When you deploy a new version of a process, it replaces the previous version's tool registration. There is no mechanism to pin an MCP client to a specific process version.

---
Source: https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-version-binding
