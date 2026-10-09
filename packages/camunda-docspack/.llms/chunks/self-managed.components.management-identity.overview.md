# Management Identity

Management Identity is the component within Camunda 8 Self-Managed responsible for authentication and authorization for Camunda Hub and Optimize.

The Management Identity component in Camunda 8 Self-Managed is used to manage authentication, access, and authorization for components outside the [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/overview): [Camunda Hub](https://docs.camunda.io/docs/next/self-managed/components/hub/index) and [Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/overview).

Management Identity controls who can sign in to Camunda Hub and Optimize, which is separate from the cluster identity stack provided by [Admin (formerly Orchestration Cluster Identity)](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/overview). Admin controls access to Zeebe, Operate, Tasklist, and the Orchestration Cluster API within each cluster. See [how identity works in Camunda](https://docs.camunda.io/docs/next/self-managed/components/identity/how-identity-works) for a decision tree covering which one to configure.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/overview
