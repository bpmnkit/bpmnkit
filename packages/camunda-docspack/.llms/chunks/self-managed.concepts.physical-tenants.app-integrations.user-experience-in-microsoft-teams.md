# App Integrations and Physical Tenants — User experience in Microsoft Teams

A Physical Tenant is not a separate selector. The Teams cluster picker lists one row per `(cluster, tenant)` pair, and choosing a row sets both at once:

- A row for the `default` tenant is labeled with the **cluster's** name.
- A row for a named tenant is labeled with the **tenant's** name.
- The cluster's health and support status is appended to every one of its rows.
- When exactly one pair is available, it is selected automatically.

Users switch tenants the same way they switch clusters, and all task lists, process starts, and deep links follow the selected pair.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/app-integrations
