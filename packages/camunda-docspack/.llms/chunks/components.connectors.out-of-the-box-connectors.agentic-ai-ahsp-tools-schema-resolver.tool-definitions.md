# Ad-hoc Tools Schema Resolver connector — Tool Definitions

For more information on how to define tools, see the [tool definitions](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-tool-definitions#tool-definitions) documentation.


## Response Structure

This connector returns a list of tool definitions in the following format. Individual tool definitions are modeled after
the [list tools response](https://modelcontextprotocol.io/specification/2025-03-26/server/tools#listing-tools) defined
in the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) specification, so you should be able to directly
use the definitions with different LLMs or transform them into the required format for your AI integration.

```json
{
  "toolDefinitions": [
    {
      "name": "GetDateAndTime",
      "description": "Returns the current date and time including the timezone.",
      "inputSchema": {
        "type": "object",
        "properties": {},
        "required": []
      }
    },
    {
      "name": "Download_A_File",
      "description": "Download a file from the provided URL.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "description": "The URL to download the file from"
          }
        },
        "required": ["url"]
      }
    },
    {
      "name": "SuperfluxProduct",
      "description": "Calculates the superflux product (a very complicated calculation) given two input numbers.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "a": {
            "type": "number",
            "description": "The first number to be superflux calculated."
          },
          "b": {
            "type": "number",
            "description": "The second number to be superflux calculated."
          }
        },
        "required": ["a", "b"]
      }
    }
  ]
}
```

You can either configure a result variable to contain the whole response or use a result expression to map parts of the
response into your process.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-ahsp-tools-schema-resolver
