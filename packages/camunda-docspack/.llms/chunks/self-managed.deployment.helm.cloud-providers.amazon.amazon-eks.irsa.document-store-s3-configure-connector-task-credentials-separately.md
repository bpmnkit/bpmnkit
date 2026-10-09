# IAM Roles for Service Accounts (IRSA) — Document store (S3) — Configure connector task credentials separately

Connectors accesses documents through the Orchestration REST API, not the document store directly. Don't grant the document-store IAM role to the Connectors service account.

Starting with Camunda 8.10 (Helm chart 15.x), the chart no longer propagates document-store credentials to the Connectors pod. If a connector task uses cloud credentials from the pod environment, configure a role or Secret scoped to the connector tasks under `connectors`, as shown in [migrate document-store cloud credentials](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100#migrate-document-store-cloud-credentials). Don't reuse the document-store role or credentials.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
