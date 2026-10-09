# Configure Camunda 8 Run — Use Camunda APIs

Camunda 8 Run exposes the Orchestration Cluster REST API locally by default at `http://localhost:8080/v2`.

- For local development, Camunda 8 Run exposes the API without requiring credentials unless you enable API protection.
- If you enable Basic authentication, include the configured username and password in your requests.
- For API concepts, endpoints, and examples, use the [Orchestration Cluster REST API overview](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).
- For deployment-specific authentication details, use [Orchestration Cluster REST API authentication](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication).

Quick connectivity check:

```bash
curl http://localhost:8080/v2/topology
```

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/configuration
