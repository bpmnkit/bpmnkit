# Migrate Component V1 APIs — Migrate V1 APIs

With Camunda 8.8, permissions for resource access have been reworked. For the V1 APIs, this means that access to endpoints now depends on specific read and write permissions for related resources.

To continue using the V1 APIs, users and clients must be assigned the appropriate permissions under [the new authorization model](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations).

Users now require wildcard (`*`) permissions for the resource type and permission type being accessed.

**Info**
For guidance on assigning permissions in Admin, see the [Admin authorization guide](https://docs.camunda.io/docs/next/components/admin/authorization).

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-component-apis
