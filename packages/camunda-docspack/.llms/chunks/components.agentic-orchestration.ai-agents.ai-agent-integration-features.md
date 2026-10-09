# AI agents — AI agent integration features

Use the following Camunda 8 features to integrate AI agents into your processes:

    **Feature**
    **Description**

    [Ad-hoc sub-process](https://docs.camunda.io/docs/next/components/modeler/bpmn/ad-hoc-subprocesses/ad-hoc-subprocesses)
    A special kind of embedded BPMN subprocess with an ad-hoc marker that allows a small part of your process decision-making to be handed over to a human or agent.

    [AI Agent connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent)
    Enables AI agents to integrate with an LLM to provide interaction/reasoning capabilities. This connector is designed for use with an ad-hoc sub-process in an agent loop, providing automated tool selection.

    [MCP Client connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client)
    Connect an AI agent connector to tools exposed by [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers.

    [Ad-hoc tools schema resolver connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-ahsp-tools-schema-resolver)
    Can be used independently with other AI connectors for direct LLM interaction. Use this connector if you don't want to use the AI agent connector but still want to resolve tools for an ad-hoc sub-process or debug tool definitions.

    [Vector database connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/embeddings-vector-db)
    Allows embedding, storing, and retrieving LLM embeddings. Use this connector to build AI-based solutions such as context document search, long-term memory for LLMs, and agentic AI interaction.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/ai-agents
