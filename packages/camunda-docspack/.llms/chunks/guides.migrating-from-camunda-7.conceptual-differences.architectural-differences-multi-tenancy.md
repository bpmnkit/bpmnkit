# Conceptual differences — Architectural differences — Multi-tenancy

There are several differences between how [multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy) works in Camunda 7 and Camunda 8:

1. The [one engine per tenant approach from Camunda 7](https://docs.camunda.org/manual/develop/user-guide/process-engine/multi-tenancy/#one-process-engine-per-tenant) isn't possible with Camunda 8. Camunda 8 only provides multi-tenancy through a tenant identifier.
2. In Camunda 7, users can deploy shared resources (processes, decisions, and forms) available to all tenants. In Camunda 8, there are no shared resources. This will be added in the future.
3. In Camunda 7, data is mapped to a `null` tenant identifier, meaning resources are shared by default. In Camunda 8, data is mapped to the `<default>` tenant identifier when multi-tenancy is disabled.
4. [Tenant checks in Camunda 7](https://docs.camunda.org/manual/develop/user-guide/process-engine/multi-tenancy/#disable-the-transparent-access-restrictions) can be disabled to perform admin/maintenance operations. This can't be done in Camunda 8, but an admin user can be authorized to all tenants, which would result in the same thing.
5. If a user tries to trigger a command on a resource mapped to multiple tenants in Camunda 7, an exception is thrown, and [the `tenantId` must be explicitly provided](https://docs.camunda.org/manual/develop/user-guide/process-engine/multi-tenancy/#run-commands-for-a-tenant). However, the Camunda 7 engine will try to infer the correct `tenantId` as much as possible. Users in Camunda 7 that are authorized for multiple tenants may perform a lot more operations without providing a `tenantId`. This inference in the Zeebe Broker doesn't happen in Camunda 8, and Zeebe asks users to provide the `tenantId` explicitly.

<!-- TODO could 1 be less relevant? -->
<!-- TODO reference roadmap item for shared resources tenant -->

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences
