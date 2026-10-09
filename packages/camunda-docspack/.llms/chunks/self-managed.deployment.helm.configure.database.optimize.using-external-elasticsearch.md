# Use external Elasticsearch for Optimize with Helm

Configure Optimize in Camunda 8 Self-Managed to use an external Elasticsearch instance when deploying with Helm.

Configure Optimize in Camunda 8 Self-Managed to connect to an external Elasticsearch instance when deploying with Helm.

This page applies to Optimize only. If the Orchestration Cluster also uses Elasticsearch as secondary storage, configure that separately using [use external Elasticsearch for Orchestration Cluster with Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/elasticsearch/using-external-elasticsearch).

Optimize supports Elasticsearch only through Elasticsearch or OpenSearch backends. It does not support RDBMS.


## Prerequisites

Before configuring, collect the following information about your external Elasticsearch instance:

- URL to access the cluster (protocol, host, and port)
- Authentication requirements and credentials (if needed)
- TLS requirements:
  - Whether the certificate is publicly trusted
  - Whether you need to provide a custom or self-signed certificate

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/optimize/using-external-elasticsearch
