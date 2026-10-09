# Use connectors and deploy processes with Docker Compose — Custom connectors

In addition to the built-in connectors, you can add custom connectors.

To include custom connectors:

- Create a new Docker image that bundles your connectors, as described in the [Connectors repository](https://github.com/camunda/connectors).
- Mount the connector JARs as volumes into the `/opt/app` directory in the Docker Compose file.

Each connector JAR must include all required dependencies inside the JAR.

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose/connectors-and-modeling
