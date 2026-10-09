# Connector types

Connectors come in type and subtypes that describe their functionality.

Connectors are categorized by the direction data flows into or out of Camunda 8.


## Outbound connectors

Outbound connectors allow workflows to trigger external systems or services, making it possible to integrate workflows with other parts of a business process or system architecture.

The Java code to connect to the external system is executed when the workflow reaches the service task.

![Outbound connectors](img/outbound-connectors.png)

Use outbound connectors if something needs to happen in the third-party system if a process reaches a service task. For example, calling a REST endpoint or publishing a message to Slack.
Outbound connectors are also what an [AI agent](https://docs.camunda.io/docs/next/reference/glossary#ai-agent) calls as its tools: the process still defines which connectors an agent is allowed to use, the same way it defines which service task runs next.

---
Source: https://docs.camunda.io/docs/next/components/connectors/connector-types
