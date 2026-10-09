# Connector SDK — Creating a custom connector — Outbound connector project outline

There are multiple parts of a connector that enable it for reuse, modeling, and the runtime behavior.
For example, the following parts make up an outbound connector:

```
my-connector
├── element-templates/
│   └── connector.json                 (1)
├── src/main
│   ├── java/io/camunda/example        (2)
│   │   ├── MyConnector.java           (3)
│   └── resources/META-INF/services
│       └── io.camunda.connector.api.outbound.OutboundConnectorProvider (4)
└── pom.xml (5)
```

For the modeling building blocks, the connector provides
[Connector templates](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-templates) with **(1)**.

You provide the runtime logic as Java source code under a package like **(2)** including an implementation of your connector, in this case `MyConnector` with **(3)**.

For a detectable connector, you are required to expose your function class name in the
[`OutboundConnectorProvider` SPI implementation](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/ServiceLoader.html)
with **(4)**.

A configuration file like **(5)** manages the project setup, including dependencies.
In this example, we include a Maven project's `POM` file. Other build tools like
[Gradle](https://gradle.org/) can also be used.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk
