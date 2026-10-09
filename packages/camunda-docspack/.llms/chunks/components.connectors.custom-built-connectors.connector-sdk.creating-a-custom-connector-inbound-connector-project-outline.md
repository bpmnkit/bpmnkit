# Connector SDK — Creating a custom connector — Inbound connector project outline

There are multiple parts of a connector that enable it for reuse, as a
reusable building block, for modeling, and for the runtime behavior.
For example, the following parts make up an inbound connector:

```
my-connector
├── element-templates
│   └── inbound-template-connector.json                                     (1)
├── pom.xml                                                      (6)
├── src
│   ├── main
│   │   ├── java/io/camunda/connector
│   │   │   └── inbound
│   │   │       ├── MyConnectorExecutable.java                              (2)
│   │   │       ├── MyConnectorEvent.java                                   (3)
│   │   │       ├── MyConnectorProperties.java                              (4)
│   │   │       └── subscription
│   │   │           ├── MockSubscription.java
│   │   │           └── MockSubscriptionEvent.java
│   │   └── resources/META-INF/services
│   │       └── io.camunda.connector.api.inbound.InboundConnectorExecutable (5)
```

For the modeling building blocks, the connector provides
[Connector element templates](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-templates) with **(1)**.

You provide the runtime logic as Java source code.
Typically, a connector runtime logic consists of exactly one implementation of
a `InboundConnectorExecutable` with **(2)** and at least one input object like **(3)**, and connector's
properties like **(4)**.

For a detectable connector function, you are required to expose your function class name in the
[`InboundConnectorExecutable` SPI implementation](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/ServiceLoader.html)
with **(5)**.

A configuration file like **(6)** manages the project setup, including dependencies.
In this example, we include a Maven project's `POM` file. Other build tools like
[Gradle](https://gradle.org/) can also be used.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk
