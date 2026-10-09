# Install Camunda for production with Helm — Create a production `values.yaml`

Use separate Helm values files and releases when you deploy Camunda components across namespaces. The Hub release contains Camunda Hub and Management Identity, and the orchestration release contains the Orchestration Cluster and Connectors. Optimize runs in its own release, one per Physical Tenant.

The [deployment topology install guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index) provides complete 8.10 examples for every release role. It also explains how to:

- Register remote Orchestration Cluster, Optimize, and Connectors clients with central Management Identity.
- Configure Camunda Hub to connect to an Orchestration Cluster in another namespace.
- Share matching client-secret values across namespace-scoped Kubernetes Secrets.
- Use the correct cross-namespace Management Identity service URL.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
