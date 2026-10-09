# End-to-end RDBMS setup guide — Step 1: Decide on topology

Before provisioning, choose whether to use a **shared database** or **separate databases** for each component.

| Aspect       | Shared database                                                 | Separate databases                                                |
| ------------ | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Use case** | Small deployments, unified DBA team                             | Large production, multi-team environments                         |
| **Setup**    | Single instance with different schemas/databases for OC and Hub | Independent instances per component                               |
| **Pros**     | Simplified administration, single backup policy                 | Independent scaling, isolated credentials, easier troubleshooting |
| **Cons**     | Shared resources, requires schema/database separation           | Additional operational overhead, higher infrastructure costs      |

Both topologies are fully supported. Choose based on your organizational model and scaling needs.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-setup-guide
