# Configure Physical Tenants across releases — Declare tenants in the Orchestration Cluster release

Add a `camunda.physical-tenants` block through `orchestration.extraConfiguration`. For the delivery options, including a single `orchestration.configuration` block or environment variables, see [configure Physical Tenants in Helm chart](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-physical-tenants).

**Warning: Declaring tenants and the `default` tenant's exporters**
How the `default` tenant exports depends on whether you declare it:

- **`default` not declared.** The runtime synthesizes the `default` tenant from the root configuration. It keeps the release's root broker configuration, including its root exporters.
- **`default` declared explicitly.** Its entry under `camunda.physical-tenants.default` is used instead. Configure its exporter assignments in that entry, and don't assume it inherits root exporters you didn't assign to it.
- **A required exporter assignment is missing.** The Orchestration Cluster can fail at startup instead of running without the exporter. Check the broker logs if the StatefulSet doesn't become ready after you add a tenant.

Every non-default tenant needs its own exporter assignments. See the [configuration reference](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants
