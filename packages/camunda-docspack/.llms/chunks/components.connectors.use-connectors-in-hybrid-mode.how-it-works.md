# Use connectors in hybrid mode — How it works

Every connector has its ID (type definition), and name. Every connector element template has a hidden property that
defines which connector is to be used to execute with a given template.

For example, see a relation between [Kafka element template](https://github.com/camunda/connectors/tree/main/connectors/kafka/element-templates)
and [Kafka connector](https://github.com/camunda/connectors/blob/main/connectors/kafka/src/main/java/io/camunda/connector/kafka/inbound/KafkaExecutable.java#L20).

For the hybrid connector runtime to work properly, you must override the connector type.

For the purpose of this guide, imagine you would like to override an HTTP REST connector with type `io.camunda:http-json:1`.
Refer to the [element template](https://github.com/camunda/connectors/blob/main/connectors/http/rest/element-templates/http-json-connector.json#L50) and its related [runtime](https://github.com/camunda/connectors/blob/main/connectors/http/rest/src/main/java/io/camunda/connector/http/rest/HttpJsonFunction.java#L43).

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors-in-hybrid-mode
