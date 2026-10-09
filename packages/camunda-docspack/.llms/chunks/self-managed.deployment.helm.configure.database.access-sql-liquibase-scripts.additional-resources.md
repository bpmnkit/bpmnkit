# Access SQL and Liquibase scripts — Additional resources

- **Checksums:** SHA1 or SHA256 checksums are provided in GitHub release assets.
- **Liquibase CLI example:** See [Liquibase getting started](https://www.liquibase.org/get-started/running-your-first-update).
- **Upgrade workflow:** Recommended approach is to allow Camunda to manage the schema automatically. Manual upgrades are supported, but users must apply scripts sequentially from the initial version to the target version.
- **Performance:** Indexes are included in scripts as needed. Adding custom indexes may affect future upgrades.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts
