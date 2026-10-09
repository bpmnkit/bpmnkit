# MCP Client tool discovery — Tool definitions

Because the AI agent must present unique tool names to the LLM while also being able to map tool calls to specific activities in the ad-hoc sub-process, it applies a naming convention to uniquely identify MCP tool names:

```
MCP_<activityId>___<toolName>>
```

For example, the `get_current_time` tool provided by
a [time MCP server](https://github.com/modelcontextprotocol/servers/tree/main/src/time) would resolve to the
following tool definition when accessed through an MCP Client activity with the ID `Time`:

```json
{
  "name": "MCP_Time___get_current_time",
  "description": "Get current time in a specific timezones",
  "inputSchema": {
    "properties": {
      "timezone": {
        "type": "string",
        "description": "IANA timezone name (e.g., 'America/New_York', 'Europe/London'). Use 'UTC' as local timezone if no timezone provided by the user."
      }
    },
    "required": ["timezone"],
    "type": "object"
  }
}
```

When handling LLM tool call requests, the MCP Client integration of the AI agent connector transparently maps the unique tool names back to the matching activity. The tool name and arguments are then passed to the MCP Client connector for the actual tool call.

### Name restrictions

Because the `___` sequence is used as a separator in the tool naming convention, **MCP client activity IDs must not contain `___`**. If an activity ID contains this reserved separator, the AI agent connector throws an error with the error code `MCP_GATEWAY_INVALID_TOOL_DEFINITIONS` when attempting tool discovery.

To resolve this error, rename the affected MCP Client activities in your BPMN model so that their IDs do not contain `___`.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-tool-discovery
