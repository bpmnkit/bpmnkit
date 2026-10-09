# Connect an external agent

Connect an agent built with an external framework, such as LangGraph or CrewAI, to Camunda.

Connect an agent built with an external framework, such as LangGraph or CrewAI, to Camunda.


## About

An [external agent](https://docs.camunda.io/docs/next/reference/glossary#external-agent) runs its [agent loop](https://docs.camunda.io/docs/next/reference/glossary#agent-loop) in its own runtime instead of Camunda's engine. Camunda orchestrates when the agent runs as part of the process, but it can only surface what the runtime reports back.

To make an external agent visible:

- **Mark the agent in the model**: add the `zeebe:agentDefinition` extension element to the BPMN element that hosts the agent, so Camunda creates an [agent definition](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances#agent-definitions) when you deploy the process.
- **Report the execution**: create an [agent instance](https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances#agent-instances) and report the agent's state, usage metrics, tools, and conversation history through the [Agent Instance API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/create-agent-instance.api) while the agent runs.

Camunda tracks an agent instance only for an element that carries an agent definition. Without the marker, the agent still runs, but it stays invisible in Operate and Optimize.

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/connect-external-agent
