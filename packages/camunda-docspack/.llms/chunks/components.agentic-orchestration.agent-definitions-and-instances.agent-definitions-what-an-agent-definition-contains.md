# Agent definitions and instances — Agent definitions — What an agent definition contains

An agent definition contains the following data:

| Property                      | Description                                                                                                                                                                                                       |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agentDefinitionKey`          | The unique key for this agent definition. A new key is assigned for the same process element on every process definition version.                                                                                 |
| `agentType`                   | The [agent type](https://docs.camunda.io/docs/next/components/agentic-orchestration/ai-agents#agent-types): either a [Camunda AI agent](https://docs.camunda.io/docs/next/reference/glossary#camunda-ai-agent) or an [external agent](https://docs.camunda.io/docs/next/reference/glossary#external-agent). |
| `name`                        | The human-readable name of the process element that owns the agent definition. Falls back to `elementId` when the element has no BPMN name configured.                                                            |
| `elementId`                   | The BPMN element ID of the process element that owns the agent definition.                                                                                                                                        |
| `processDefinitionId`         | The BPMN process ID of the process definition that owns the agent definition.                                                                                                                                     |
| `processDefinitionKey`        | The key of the process definition that owns the agent definition.                                                                                                                                                 |
| `processDefinitionVersion`    | The version of the process definition that owns the agent definition.                                                                                                                                             |
| `processDefinitionVersionTag` | The version tag of the process definition that owns the agent definition.                                                                                                                                         |
| `tenantId`                    | The tenant ID of this agent definition.                                                                                                                                                                           |

---
Source: https://docs.camunda.io/docs/next/components/agentic-orchestration/agent-definitions-and-instances
