# Helm chart diagnostics

Get diagnostics and logs from a Helm chart deployment.


## Diagnostics collection script

This script automates the process of gathering logs and diagnostics from a Camunda Helm chart deployment running in a Kubernetes cluster. The script collects all relevant information (including pod logs, events, resource details, and Elasticsearch/OpenSearch diagnostics) into a single directory, and outputs it in a `.zip` file to make it easier to share this information with the Camunda Support team.

**Caution: Data privacy notice**
Before sharing the generated diagnostics file with Camunda Support, review and remove any sensitive information such as passwords, API keys, personal data, or business-sensitive data from the collected logs, configuration data, and Elasticsearch/OpenSearch data. This includes the collected actuator outputs: the `configprops` endpoint masks credential-like values, but connection URLs, hostnames, and bucket names are not redacted. The Elasticsearch/OpenSearch data can also include index documents that may contain business or personal data — pass the `--skip-es-os` flag to skip exporting Elasticsearch/OpenSearch data entirely.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/diagnostics
