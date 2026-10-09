# Developer quickstart with Docker Compose

A quickstart guide for developers to deploy and run Camunda 8 Self-Managed locally with Docker Compose, including setup, configuration, secondary storage, connectors, and modeling.

Get started with Docker Compose to run Camunda 8 Self-Managed locally. The default lightweight configuration includes the Orchestration Cluster and Connectors, and uses file-based H2 secondary storage. The full configuration additionally includes Optimize, Camunda Hub, Management Identity, Keycloak, PostgreSQL, and Elasticsearch.

Docker Compose also supports [document handling](https://docs.camunda.io/docs/next/self-managed/concepts/document-handling/overview), configurable secondary storage, built-in connectors, custom connectors, and modeling workflows with Desktop Modeler and Camunda Hub.

**Note**
The [Docker images](https://docs.camunda.io/docs/next/self-managed/deployment/docker/docker) are supported for production usage. The Docker Compose files are intended for local development and evaluation, and are not designed for production. For production deployments, use [Kubernetes with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/index).

Camunda 8 with Docker Compose includes the following:

- Orchestration Cluster
- Connectors
- File-based H2 as the default secondary storage in the lightweight configuration

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose
