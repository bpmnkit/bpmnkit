# Deployment configuration

Learn how to configure upload limits and multipart handling for Orchestration Cluster REST API.


## Deployment configuration

The Orchestration Cluster REST API supports file and multipart uploads when deploying BPMN diagrams and other resources. By default, the maximum allowed request size is 4MB. You can increase this limit in Self-Managed cluster through configuration of the Zeebe Gateway, Broker, and the REST layer, for example, Spring Boot and Tomcat.

This guide walks you through adjusting these settings.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/orchestration-cluster-api-rest-deployment-configuration
