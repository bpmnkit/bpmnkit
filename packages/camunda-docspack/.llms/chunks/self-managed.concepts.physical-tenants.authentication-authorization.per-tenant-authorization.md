# Authentication and authorization for Physical Tenants — Per-tenant authorization

Roles, permissions, and mapping rules are local to each Physical Tenant. They are **not** stored or managed in the identity provider.

- Each Physical Tenant has its own roles and permission definitions.
- Mapping rules translate IdP token claims into Camunda roles independently per tenant.
- A user can be admin in one tenant and read-only in another, defined independently in each tenant.

The IdP only authenticates users and supplies claims. The tenant's local mapping rules in Camunda determine what a user can do within that tenant.


## Per-tenant role and permission definitions

Each Physical Tenant defines its own roles, permissions, and mapping rules independently. There is no automatic cross-tenant role inheritance from the cluster level.

Role definitions within a tenant cover:

- What operations a role can perform within that tenant (for example, deploy processes, start instances, complete tasks)
- Which token claims or values map to which Camunda roles within that tenant

Because each tenant manages its own authorization, the same user can have different permissions in different Physical Tenants.

### Per-tenant initialization configuration

Per-tenant roles, mapping rules, and authorizations use the same configuration shape as the cluster-wide [`camunda.security.initialization`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundasecurityinitializationauthorizations) properties, declared under `camunda.physical-tenants.<tenantId>.security.initialization` instead:

```yaml
camunda:
  physical-tenants:
    tenanta:
      security:
        initialization:
          roles:
            - roleId: tenant-a-admin
              name: Tenant A Admin
              mappingRules:
                - team-a-admins-mapping
          mappingrules:
            - mapping-rule-id: team-a-admins-mapping
              claim-name: groups
              claim-value: team-a-admins
          authorizations:
            - ownerType: ROLE
              ownerId: tenant-a-admin
              resourceType: PROCESS_DEFINITION
              resourceId: "*"
              permissions:
                - READ
                - UPDATE
```

Every explicitly configured Physical Tenant must declare its own `security.initialization` block when authorization is enabled for that tenant. The block is not inherited from the root configuration. Reusing the cluster-wide seed across tenants would create identical admin users and authorizations in every tenant, defeating tenant isolation. Two cases are exempt:

- The **default** Physical Tenant, which keeps the top-level `camunda.security.initialization`, whether synthesized from the root or declared explicitly.
- Any tenant with `security.authorization.enabled: false` (per-tenant override, or inherited from the root), since the initialization block only takes effect when authorization is enabled.

If a non-default tenant with authorization enabled omits the block, startup fails:

```text
Each explicitly-configured physical tenant must declare its own initialization block under
'camunda.physical-tenants.<id>.security.initialization.*' when authorization is enabled for that
tenant; it may not be inherited from the root (the 'default' tenant keeps the top-level
'camunda.security.initialization'). Physical tenants missing a required initialization block:
[tenanta, tenantb]
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization
