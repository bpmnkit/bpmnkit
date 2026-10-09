# Integrate a built-in connector

Ready to use out of the box, connectors help automate complex business processes by inserting them into BPMN diagrams.

Integrate a [built-in connector](https://docs.camunda.io/docs/next/components/connectors/introduction) to reduce the time it takes to automate and orchestrate business processes across systems.


## About

With built-in connectors, you can automate complex [business processes](https://docs.camunda.io/docs/next/components/concepts/processes) by inserting them into [BPMN diagrams](https://docs.camunda.io/docs/next/components/modeler/bpmn/automating-a-process-using-bpmn) within your [Camunda Hub](https://docs.camunda.io/docs/next/components/modeler/about-modeler) projects and configuring them with the properties panel.

You can also orchestrate APIs, for example by working with a [REST connector](https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-apis). Learn more about [types of connectors](https://docs.camunda.io/docs/next/components/connectors/connector-types).

Connectors technically consist of two parts:

- The business logic is implemented as a [job worker](https://docs.camunda.io/docs/next/components/concepts/job-workers)
- The user interface during modeling is provided using an element template.

In this tutorial, you'll walk step-by-step through the implementation of a sample connector.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/configuring-out-of-the-box-connector
