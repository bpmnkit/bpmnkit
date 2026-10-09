# Storage isolation — Operational considerations — Cross-tenant isolation

Storage isolation prevents data leakage structurally:

- RDBMS: Each schema is logically separate
- ES/OS: Index prefixes are distinct boundaries
- Document Store: Separate buckets or subpaths

Risks to avoid:

- Don't share JDBC connection URLs between tenants (for Oracle, two tenants can share the same URL while remaining isolated by distinct authenticated database users)
- Don't overlap index prefixes
- Don't point two tenants to the same bucket or container without distinct sibling subpaths. Don't nest one tenant's subpath inside another's, and don't leave one tenant on the bucket or container root

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
