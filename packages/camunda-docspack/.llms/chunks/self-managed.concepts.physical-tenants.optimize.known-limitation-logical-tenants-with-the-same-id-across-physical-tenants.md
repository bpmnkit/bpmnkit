# Optimize and Physical Tenants — Known limitation: logical tenants with the same ID across Physical Tenants

[Logical tenants](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/multi-tenancy) remain available inside a Physical Tenant's Optimize instance, so a team can still subdivide its own workload by tenant ID. This is independent of Physical Tenant isolation, and it has a gap when Management Identity is shared:

Management Identity's tenant-authorization lookup has no concept of Physical Tenant. It returns a flat set of logical tenant IDs the user is assigned to, without saying which Physical Tenant's Optimize instance that assignment was meant for.

If the same logical tenant ID exists in two different Physical Tenants (for example, both tenant A and tenant B define a logical tenant called `b`), and a user:

1. is assigned that logical tenant ID in Management Identity, and
2. holds the Optimize role for both Physical Tenants' Optimize instances (see the role grant above),

that user sees the logical tenant's data in both Optimize instances, even though the underlying data belongs to two different, and otherwise isolated, Physical Tenants. Neither Optimize instance can tell that the two identically-named logical tenants are unrelated.

This only applies to a user who is already independently granted the Optimize role on both Physical Tenants' Optimize instances. A user granted the Optimize role for only one Physical Tenant's Optimize instance never reaches the other one, regardless of logical tenant assignment.

### How to avoid this

Choose one of the following when running several Physical Tenants' Optimize instances behind one shared Management Identity:

- Use unique logical tenant IDs across every Physical Tenant. This is the simplest option and removes the collision entirely. Camunda does not validate logical tenant ID uniqueness across Physical Tenants, so this is a naming convention you enforce yourself.
- Avoid granting the Optimize role for more than one Physical Tenant's Optimize instance to the same user, if you do reuse logical tenant IDs across tenants and need to keep them isolated.
- Run a separate Management Identity per Physical Tenant if you need both identical logical tenant IDs across tenants and independent enforcement of them. This trades the simpler single-Identity setup described above for full per-tenant identity isolation.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/optimize
