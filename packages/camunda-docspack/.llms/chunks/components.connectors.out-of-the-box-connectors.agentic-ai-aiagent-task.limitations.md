# AI Agent Task connector — Limitations

### No event handling support

Unlike the AI Agent Sub-process implementation, the AI Agent Task implementation does not support event handling as part of an [event subprocess](https://docs.camunda.io/docs/next/components/modeler/bpmn/event-subprocesses/event-subprocesses).

If you want to handle events while the AI agent is working on a task, use the [AI Agent Sub-process](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess) implementation instead.

### Process definition not found errors when running the AI Agent for the first time

The AI Agent Task implementation relies on the eventually consistent [Get process definition XML API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-process-definition-xml.api) to fetch the BPMN XML source when resolving available tool definitions.

- If you deploy a new or changed process and directly run it after (for example using **Deploy & Run**), the process definition might not be available when the AI Agent attempts to fetch the process definition XML.
- It will retry to fetch the definition several times, but if the definition is still not available after the retries are exhausted, the connector will fail with a "Process definition not found" error and raise an incident.

To avoid this error, wait a few seconds before running a newly deployed new or changed process, to allow the exporter to make the process definition available via the API.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task
