# Build a custom connector — Understand the connector architecture

A connector consists of the Java backend and an element template that defines the user interface used in [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/index) and [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index).

- The Java code defines the connector’s functionality and how it interacts with an external system. For example, the [Connector function](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk#outbound-connector-runtime-logic) used for outbound connectors.

- The user interface allows you to configure and use the connector in Camunda Hub and Desktop Modeler. This is defined in a [Connector template](https://docs.camunda.io/docs/next/components/connectors/manage-connector-templates) that controls how the BPMN element is shown in the modeling interface and which configuration options are available for the connector.

This separation enables a layered approach to building connectors. You can customize the user interface and configuration options in Hub or Desktop Modeler using connector templates, without modifying the underlying Java code.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/build-connector
