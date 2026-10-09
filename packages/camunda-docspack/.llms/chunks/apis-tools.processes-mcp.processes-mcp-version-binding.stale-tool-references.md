# Version binding — Stale tool references

MCP clients typically cache the tool list after connecting. If a client cached the tool list before a redeployment and then attempts to call the now-replaced tool, it receives an error instructing it to refresh its tool list by running tool discovery again.

MCP clients must therefore:

1. Handle the stale-tool error gracefully.
2. Re-fetch the tool list by running tool discovery again before retrying.


## Implications for process owners

Redeploying a process with a changed interface, such as a different tool name, input parameters, or output variables, is a breaking change for any MCP client currently holding a reference to that tool.

To reduce disruption:

- Communicate planned redeployments to teams operating MCP clients that use your process tool.
- When making a significant interface change, consider deploying a new process with a different tool name rather than redeploying over the existing one. This lets existing clients continue using the old version while new clients adopt the updated tool.

---
Source: https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-version-binding
