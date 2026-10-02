---
"@bpmnkit/proxy": minor
---

The MCP server gets `find_connectors { query }`, which returns connector cards plus the endpoints of an indexed HTTP API the query names. It also gets `add_connector { processId, id, alias, operation, values }`, which configures a node through the same resolver as `with` lines. A literal credential becomes a `{{secrets.NAME}}` placeholder, and inputs still missing are reported. AI chat runs may call both, and the chat prompt tells the model to use them for any outside system.
