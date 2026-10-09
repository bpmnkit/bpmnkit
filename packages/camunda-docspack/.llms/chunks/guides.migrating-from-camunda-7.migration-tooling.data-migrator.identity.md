# Identity

Copy identity data from Camunda 7 to 8.

Use the Identity Data Migrator to copy authorizations and tenants to Camunda 8.


## About identity migration

Identity data in Camunda includes:

- **Identities**: Users, groups, tenants, and their related memberships
- **Authorizations**: Permission rules that control access to resources

For more information about limitations, refer to the [limitations](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations#identity) of the Identity Data Migrator.

### Users, groups, and group memberships

- The Identity Data Migrator does **not** migrate Camunda 7 internally managed users, groups, and group memberships to Camunda 8.
- We recommend integrating Camunda 8 with your organization's external Identity Provider (IdP) instead.
- Most organizations use an IdP to manage users, groups, and group memberships centrally, making manual migration unnecessary.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/identity
