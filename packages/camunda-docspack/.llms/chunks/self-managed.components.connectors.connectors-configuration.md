# Configuration

Configure the connector runtime environment based on the Zeebe instance, the connector functions to run, and available secrets.

You can configure the connector runtime environment in the following ways:

- Specify the Zeebe instance to connect to.
- Define the connector functions to run.
- Provide the secrets that should be available to the connectors.

**Note**
Starting from version 8.8, the connector runtime no longer requires a connection to Operate. It now depends only on the Orchestration Cluster REST API and Zeebe.

To connect to the **Orchestration Cluster**, the connector runtime uses the [Camunda Spring Boot Starter](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started). Any configuration available in the Spring Boot Starter can also be applied to the connector runtime environment.

Below are some of the most common configuration options for the connector runtime. For a complete list, see the [Camunda Spring Boot Starter configuration reference](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration#zeebe).

**Note**
This guide presents configuration properties as environment variables, while the Camunda Spring Boot Starter documentation uses Java configuration properties. The two formats are interchangeable. You can also use Java configuration properties in the connector runtime environment.

For example, the Java configuration property `camunda.client.grpc-address` can be set as the environment variable `CAMUNDA_CLIENT_GRPCADDRESS` in the connector runtime.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
