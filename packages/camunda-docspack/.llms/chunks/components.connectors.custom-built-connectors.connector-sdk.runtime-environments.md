# Connector SDK — Runtime environments

To integrate connectors with your business use case, you need a runtime environment to act as the intermediary between
your business and connectors space.

The Connector SDK enables you to write environment-agnostic runtime behavior for connectors.
This makes the connector logic reusable in different setups without modifying your connector
code. To invoke this logic, you need a runtime environment that knows the connector function
and how to call it.

In Camunda 8 SaaS, every cluster runs a component that knows the
[available out-of-the-box connectors](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview)
and how to invoke them. This component is the runtime environment specific to Camunda's SaaS use case.

Regarding Self-Managed environments, you are responsible for providing the runtime environment that
can invoke the connectors.

There are several runtime options provided by Camunda:

- [Spring Boot Starter runtime](#spring-boot-starter-runtime)
- [Docker runtime image](#docker-runtime-image)

### Spring Boot Starter runtime

This option is applicable for Spring Boot users. All you need to do is to include respective starter:

```xml
<dependency>
    <groupId>io.camunda.connector</groupId>
    <artifactId>spring-boot-starter-camunda-connectors</artifactId>
    <version>${version.connectors}</version>
</dependency>
<dependency>
    <groupId>org.myorg</groupId>
    <artifactId>connector-my-awesome</artifactId>
    <version>${version.connector-my-awesome}</version>
</dependency>
```

Upon starting your Spring Boot application, you will have a job worker connected to Zeebe, waiting to
receive jobs for your connectors.

### Docker runtime image

This option is applicable for those users who prefer Docker.

Make sure to have an orchestration cluster running. A good start is the [Camunda Distributions](https://github.com/camunda/camunda-distributions/tree/main/docker-compose) docker compose repository.

Clone the repository. Switch into the version folder you would like to run and start the cluster:

```shell
docker compose -f docker-compose.yaml up
```

The latest Connectors Docker images can be found at the [Docker Hub](https://hub.docker.com/r/camunda/connectors).

You can start the runtime including your Connector jar by running:

```shell
docker run --rm -i \
  -v $PWD/your-connector.jar:/opt/app/connector.jar \         # Add a connector jar to the classpath
  --network=camunda \                                         # Optional: Attach to the orchestration cluster Docker network
  -e CAMUNDA_CLIENT_MODE=self-managed \                       # Connect to a Self-Managed cluster
  -e CAMUNDA_CLIENT_GRPCADDRESS=http://orchestration:26500 \  # Specify cluster gRPC API address
  -e CAMUNDA_CLIENT_RESTADDRESS=http://orchestration:8080 \   # Specify cluster REST API address
  camunda/connectors:X.Y.Z                                    # Connector docker image version
```

If you would like to disable inbound connectors, you can do so by setting `CAMUNDA_CONNECTOR_POLLING_ENABLED=false`.

These environment variables map to the same Camunda client properties used across all Camunda 8 components. For the full list of properties, their env var equivalents, and authentication method examples, see [Connectors configuration](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration).

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk
