# Configure custom HTTP headers for database clients

Learn how to add custom HTTP headers to database clients in Camunda 8 Self-Managed.

You can add custom HTTP headers to the Elasticsearch or OpenSearch clients used by Camunda components by creating a Java plugin and adding it to your Camunda 8 Self-Managed installation. When Elasticsearch/OpenSearch is configured as your secondary storage backend, custom headers can help with authentication, tracking, or debugging for those requests. See [Elasticsearch/OpenSearch](https://docs.camunda.io/docs/next/reference/glossary#elasticsearchopensearch).

This page applies to both the Orchestration Cluster and Optimize when they connect to Elasticsearch or OpenSearch.


## Prerequisites

- A deployed Camunda 8 Self-Managed Helm chart installation
- Access to modify container configurations
- Basic knowledge of Java development
- Maven or Gradle build environment

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/configure-db-custom-headers
