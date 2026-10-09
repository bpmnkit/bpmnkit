# Connector templates

Learn how to modify BPMN elements with connector templates to create custom modeling experiences.

Connectors are available [out-of-the-box (OOTB)](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview) and come with [connector templates](https://docs.camunda.io/docs/next/components/connectors/manage-connector-templates) that customize how a BPMN element is shown
and how it can be configured by process developers. Connector templates are a specific type of [element template](https://docs.camunda.io/docs/next/components/modeler/element-templates/about-templates), which can also be used when creating custom connectors via the [Connector SDK](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk).

Additionally, the [Camunda Marketplace](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/camunda-marketplace) provides connectors by Camunda partners and community contributors.

Before developing one, you'll need to decide what you would like to achieve with your connector. Currently, the options are:

- Starting a BPMN process, triggered by external service. Use [inbound start event connector template](#inbound-start-event-connector-templates).
- Continue process with an intermediate catch event emitted by external service call. Use [inbound intermediate catch event connector templates](#inbound-intermediate-catch-event-connector-templates).
- Trigger an external service. Use [outbound connector template](#outbound-connector-templates).

**Note**
Do not confuse **Connector templates** with the **[Connector template](https://github.com/camunda/connector-template-outbound)**,
which is used to supply boilerplate code and configuration when developing a new custom connector.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-templates
