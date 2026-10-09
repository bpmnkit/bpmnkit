# Expose a process as an MCP tool — Step 3: Design the process execution

When an MCP client calls the tool:

1. The Processes MCP Server starts a new process instance with the tool call arguments mapped as process variables.
2. The server immediately returns the started process instance key to the MCP client.

You can map the incoming tool call arguments from the LLM to the process variables your process expects using the **Output mapping** property. If you don't define any explicit output mapping, all incoming tool call arguments become process variables with the same names.


## Step 4: Deploy the process

Deploy the process to your Orchestration Cluster. After deployment, the Processes MCP Server automatically registers the process as an MCP tool using the metadata you configured.

**Important: Version binding**
Only the latest deployed version of a process is exposed as an MCP tool. If you redeploy the process with a changed interface, existing MCP clients holding a cached reference to the old tool will receive a stale-tool error and must re-fetch the tool list. See [version binding](https://docs.camunda.io/docs/next/apis-tools/processes-mcp/processes-mcp-version-binding) for more details.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/expose-process-as-mcp-tool
