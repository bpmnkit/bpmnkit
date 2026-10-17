# Limitations

Data Migrator limitations.

An overview of the current limitations of the Camunda 7 to Camunda 8 Data Migrator, covering general limitations as well as specific limitations related to variables and BPMN elements.

**Note**
These limitations apply to moving data from Camunda 7 to Camunda 8. To migrate a running Camunda 8 process instance to a different Camunda 8 process definition, see [process instance migration](https://docs.camunda.io/docs/next/components/concepts/process-instance-migration), which has a different set of limitations. Multi-instance elements in particular are treated differently by the two features.


## Identity

The following requirements and limitations apply:

- Identity migration includes the migration of:
  - Users, groups, tenants and their associated memberships.
  - Supported authorizations (detailed in the [Authorizations](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/identity#authorizations) section).
- Once migration has been triggered, it's strongly recommended not to create new identity data on Camunda 7. Even if migration is attempted again, the new data might not be migrated.
- In order for authorizations to work correctly after migration, process definitions, forms, DRD and decision definitions need to have the same IDs in Camunda 8 as in Camunda 7. This should be the case if you have already migrated runtime and history data.
- Tenant memberships are migrated as part of their respective tenants and are not tracked individually.
  - If a tenant is migrated, all its memberships are migrated as well. If a tenant is skipped, its memberships are also skipped.
  - If the migration of an individual tenant membership fails (for example, due to a missing user), it cannot be retried.
  - The `--list-skipped` and `--list-migrated` options do not list individual tenant memberships.
  - This is also true for groups and group memberships.
- For security reasons, passwords for users cannot be migrated. For this reason, users are migrated with a generated secure password that needs to be reset by an administrator after migration.

### Supported entities

| Identity type      | Migration supported |
| ------------------ | ------------------- |
| Users              | Yes                 |
| Groups             | Yes                 |
| Group Memberships  | Yes                 |
| Tenants            | Yes                 |
| Tenant Memberships | Yes                 |

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/limitations
