# Conceptual differences — Architectural differences — Different data types

In Camunda 7, you can store different data types, including serialized Java objects.

Camunda 8 only allows storage of **primary data types or JSON** as process variables. This might require some additional data mapping in your code when you set or get process variables.

Camunda 7 provides [Camunda Spin](https://docs.camunda.org/manual/latest/reference/spin/) to ease XML and JSON handling. This is not available with Camunda 8, and ideally you migrate to an own data transformation logic you can fully control (for example, using Jackson).

To migrate existing process solutions that use Camunda Spin heavily, you can still add the Camunda Spin library to your application itself and use its API to do the same data transformations as before in your application code.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences
