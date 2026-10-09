# MCP processes — Troubleshoot

- **A process is not appearing after deployment**: Verify that the process was deployed successfully and that the MCP start event element template is applied to the start event. Check for deployment errors in Operate.
- **A process shows an unexpected version:** The Processes MCP Server always exposes the latest deployed version. If a previous version is showing, a newer deployment may have failed. See [version binding](https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-version-binding) for more details.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/mcp-processes
