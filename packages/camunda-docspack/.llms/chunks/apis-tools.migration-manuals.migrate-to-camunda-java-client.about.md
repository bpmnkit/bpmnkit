# Migrate to the Camunda Java Client — About

This guide provides an overview of the process for migrating to the Camunda Java Client.

- The [Camunda Java Client](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started) is the official Java library for connecting to Orchestration Cluster, automating processes, and implementing job workers.
- The Zeebe Java Client remains available until Camunda 8.10.

**Tip**
Plan and start your migration early to ensure compatibility, access to latest features, and future support.


## Before you begin

- Review project dependencies and identify where `io.camunda.zeebe:zeebe-client-java` is used.
- Catalog code referencing Zeebe classes, interfaces, and APIs (for example, ZeebeClient, Zeebe workers).

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-java-client
