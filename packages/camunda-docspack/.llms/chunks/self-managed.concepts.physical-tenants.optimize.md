# Optimize and Physical Tenants

Learn how to deploy Optimize per Physical Tenant, how one Management Identity isolates multiple Optimize deployments, and the limitation with logical tenants that reuse the same ID across tenants.

Deploy a separate Optimize instance for each Physical Tenant, and share one Management Identity across all of them. With distinct Optimize audiences and roles, each Optimize instance authorizes access to its own data. If you also use logical tenants inside those instances, avoid the logical-tenant-ID collision described below.

**Note**
This page assumes familiarity with the [Physical Tenant isolation model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index) and the identity deployment models in [authentication and authorization](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/optimize
