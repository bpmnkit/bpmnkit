# Camunda manual installation — Connectors — Run Connectors

Both the pre-bundled and runtime-only versions of the Connectors behave the same at runtime. They automatically detect and register all connectors available on the classpath during execution. Each connector uses its default configuration as defined by the `@OutboundConnector` or `@InboundConnector` annotations.

Consider the following file structure:

```shell
/home/user/connectors $
└── connector-runtime-(application|bundle)-x.y.z-with-dependencies.jar
```

To start the connector runtime locally, run:

```shell
java -jar /home/user/connectors/connector-runtime-bundle-x.y.z-with-dependencies.jar
```

The runtime bundle is packaged as a Spring Boot uber-jar (with its dependencies under `BOOT-INF/lib/`), so it must be launched with `java -jar`. The older flat-classpath invocation (`java -cp "/home/user/connectors/*" "io.camunda.connector.runtime.app.ConnectorRuntimeApplication"`) no longer works as of connector runtime 8.9.4.

To load additional custom connectors, place their JARs in a separate directory and point Spring Boot's loader at it:

```shell
java -Dloader.path=/home/user/custom-connectors \
  -jar /home/user/connectors/connector-runtime-bundle-x.y.z-with-dependencies.jar
```

This starts a Zeebe client, registering the defined connector as a job worker. By default, it connects to a local Zeebe instance at port `26500`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
