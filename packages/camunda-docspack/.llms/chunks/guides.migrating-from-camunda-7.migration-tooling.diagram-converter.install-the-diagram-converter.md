# Diagram Converter — Install the Diagram Converter

### Hosted Diagram Converter

Use the hosted Diagram Converter at [https://diagram-converter.camunda.io/](https://diagram-converter.camunda.io/). This option requires no local setup and is suitable for quick evaluations or one-off migrations.

Your models are not stored on this platform, and all processing happens in-memory. Your data is transmitted securely over HTTPS.

**Note**
The hosted version has a limit on the number of files that can be processed in a single batch request. If you need to convert a larger number of files, use the [local web application](#local-web-application) or the [CLI](#use-the-cli).

### Local web application

#### Prerequisites

- Java 21 or later

#### Steps

1. Download the latest `camunda-7-to-8-diagram-converter-webapp-{version}.jar` from [GitHub Releases](https://github.com/camunda/camunda-7-to-8-migration-tooling/releases).
2. Run the application:

   ```shell
   java -jar camunda-7-to-8-diagram-converter-webapp-{version}.jar
   ```

3. Access the web application at [http://localhost:8080/](http://localhost:8080/).

To run the application on a different port, for example `8090`:

```shell
java -jar camunda-7-to-8-diagram-converter-webapp-{version}.jar --server.port=8090
```

To increase the maximum number of files allowed per batch request (default is 100), configure `server.tomcat.max-part-count`:

```shell
java -jar camunda-7-to-8-diagram-converter-webapp-{version}.jar --server.tomcat.max-part-count=200
```

### CLI installation

#### Prerequisites

- Java 21 or later

#### Steps

1. Download the latest `camunda-7-to-8-diagram-converter-cli-{version}.jar` from [GitHub Releases](https://github.com/camunda/camunda-7-to-8-migration-tooling/releases).
2. Verify the installation:

   ```shell
   java -jar camunda-7-to-8-diagram-converter-cli-{version}.jar --help
   ```

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/diagram-converter
