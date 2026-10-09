# Connector SDK — Creating a custom connector — Inbound connector element template

To create reusable building blocks for modeling, you are required to provide a
domain-specific [Connector element template](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-templates).

A connector template defines the binding to your connector runtime behavior via the following object:

```json
{
  "type": "Hidden",
  "value": "io.camunda:mytestinbound:1",
  "binding": {
    "type": "zeebe:property",
    "name": "inbound.type"
  }
}
```

This type definition `io.camunda:mytestinbound:1` is the connection configuring which version of your connector runtime
behavior to use. In technical terms, this defines the **Type** of jobs created for tasks in your process model that use
this template. Consult the [job worker](https://docs.camunda.io/docs/next/components/concepts/job-workers) guide to learn more.

Besides the type binding, connector templates also define the properties of your connector as `zeebe:property` objects.
For example, you can create the input variable `sender` of your connector in the element template as follows:

```json
{
  "type": "String",
  "label": "Sender",
  "description": "Message sender name",
  "value": "Alice",
  "binding": {
    "type": "zeebe:property",
    "name": "sender"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk
