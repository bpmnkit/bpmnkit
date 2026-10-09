# Authentication and authorization for Physical Tenants

Learn how identity providers, token routing, and per-tenant authorization work for Physical Tenants.


## About

Learn how identity providers connect to Physical Tenants and how tokens are routed to the correct tenant. For the resource and permission model and cluster-wide versus tenant-local authorization, see [authorization model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authorization-model).

For configuration properties used to assign identity providers to tenants, see [configuration reference](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference).


## Centralized identity model

Identity is **centralized at the cluster boundary**. This means:

- Identity providers (IdPs) are defined once at the cluster level.
- Each Physical Tenant selects which cluster-defined providers it accepts using `providers.assigned`.
- Physical Tenants cannot introduce their own IdP definitions outside the cluster-level list.

This design keeps identity management simple and avoids per-engine IdP fragmentation, which is explicitly not recommended for Physical Tenants. Configuring a separate identity provider per engine increases operational complexity without additional security benefit for most use cases.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization
