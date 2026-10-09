# Multi-tenancy — Multi-Cluster

Full isolation through dedicated infrastructure with separate clusters per tenant. Maximum isolation and operational independence, but highest infrastructure cost and complexity.

This model is best for separate organizations with maximum isolation requirements or strict data residency needs.

On SaaS, this means provisioning a separate cluster per tenant rather than configuring a distinct mode. See [Clusters](https://docs.camunda.io/docs/next/components/concepts/clusters).

For example, a retail bank and an investment bank under the same parent company might each run their own dedicated cluster, with no shared processes, storage, or networking between them:


## Next steps

- Configure [Logical Tenants](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-logical-tenants) for lightweight subdivision.
- Explore [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/physical-tenants) for strong isolation.
- Manage [tenants in Identity](https://docs.camunda.io/docs/next/self-managed/components/management-identity/manage-tenants).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-tenancy/index
