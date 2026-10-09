# Camunda manual installation — Connectors — Configure Connectors

If you run Connectors on the same machine as the Orchestration Cluster, change the default port (`8080`) to avoid conflicts.

Connectors require authentication to communicate with the Orchestration Cluster REST API and Zeebe.

By default, Connectors connect to:

- `localhost:8080` (Orchestration Cluster REST API)
- `localhost:26500` (Zeebe)

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/install
