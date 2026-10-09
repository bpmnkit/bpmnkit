# Install Camunda 8 Self-Managed for production and advanced development setups — Production storage choices

Choosing the right storage configuration is a critical step for production deployments:

- Install Camunda 8 using one of the production deployment options above (Helm/Kubernetes recommended).
- Review storage concepts: [primary and secondary storage overview](https://docs.camunda.io/docs/next/components/concepts/concepts-overview) and [details on secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index).
- Provision your chosen storage backend(s) before enabling web applications such as Operate, Tasklist, or Optimize.

Guidance:

- Prefer managed services or operator-based infrastructure for production deployments to reduce operational overhead and improve reliability (for example, managed secondary storage services such as Elasticsearch/OpenSearch or managed RDBMS). Choose the backend that best fits your operational model, performance profile, and compliance requirements.
- Benchmark and size your environment using [sizing your environment](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment) and the Camunda benchmark project referenced there.

**Info**
For environment compatibility and supported versions, see [supported environments](https://docs.camunda.io/docs/next/reference/supported-environments).

---
Source: https://docs.camunda.io/docs/next/self-managed/setup/overview
