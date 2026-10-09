# Multi-tenancy — Default tenant authorizations in Optimize

If multi-tenancy is enabled across components, users will be allowed to view any data from tenants for which they have authorizations configured in Identity.
If multi-tenancy is disabled in Optimize, all users will be allowed to view data from the `<default>` tenant only and no data from other tenants.

If multi-tenancy is enabled in Optimize, but disabled in Identity or Identity is not reachable for other reasons, users will not have any tenant authorizations in Optimize and will not be able to access the data of any tenants in Optimize.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/multi-tenancy
