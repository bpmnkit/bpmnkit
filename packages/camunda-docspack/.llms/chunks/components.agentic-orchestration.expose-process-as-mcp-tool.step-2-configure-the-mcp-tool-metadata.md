# Expose a process as an MCP tool — Step 2: Configure the MCP tool metadata

The properties you fill in become the MCP tool's metadata, which AI agents and LLMs use to decide when and how to call your process.

Define them in clear and concise language. Vague or incomplete metadata leads to incorrect tool selection or missing arguments.

| Property                  | Required | Description                                                                                                                                                               |
| :------------------------ | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Name**                  | Yes      | The MCP tool identifier used by clients to call this process. Alphanumeric characters, hyphens (`-`), underscores (`_`), and dots (`.`) **only**. Maximum 100 characters. |
| **What it does**          | Yes      | A plain-language description of the process function, shown to LLMs as tool metadata.                                                                                     |
| **Which inputs it needs** | Yes      | A plain-language description of required and optional input parameters, their types, and any constraints.                                                                 |
| **When to use**           | No       | Specific situations or user intents that should trigger this tool.                                                                                                        |
| **When not to use**       | No       | Conditions or situations where this tool should not be invoked.                                                                                                           |
| **What the tool returns** | No       | The outcomes, results, and variable names the process produces on completion.                                                                                             |

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/expose-process-as-mcp-tool
