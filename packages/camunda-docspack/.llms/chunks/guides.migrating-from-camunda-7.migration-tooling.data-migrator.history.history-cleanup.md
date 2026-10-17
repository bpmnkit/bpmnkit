# History — History Cleanup

Instances that were already completed in Camunda 7 retain their original cleanup dates:

- If a `removalTime` exists in Camunda 7, it is migrated as-is. Child entities (user tasks, variables, flow nodes) inherit the root instance's cleanup date.
- If no `removalTime` exists, no cleanup date is set.
- Auto-cancel cleanup configuration **only applies to instances that were active or suspended** in Camunda 7.

If Camunda 8 is running during migration with cleanup dates in the past, history cleanup may delete parent entities before their children are migrated, causing children to be skipped.

**Common scenarios:**

- Past `removalTime` values from Camunda 7
- Negative auto-cancel TTL (for example, `P-1D`)
- Long migrations where dates become due during execution

As a result, you will see skipped child entities with messages referencing the deleted parent. These cannot be recovered unless the parent is re-migrated.

Choose one approach to prevent cleanup interference:

### shutdown

**Stop Camunda 8 during migration**

- Stop Camunda 8 cluster before migration
- Run migration while offline
- Start Camunda 8 when complete

✅ Guarantees no cleanup interference

### future-dates

**Set cleanup dates in the future**

- Update Camunda 7 removal times before migration (if feasible)
- Configure positive TTL for auto-canceled instances (for example, `P6M`, `P1Y`)

✅ Prevents immediate cleanup

### accept

**Allow concurrent cleanup**

- Run Camunda 8 during migration
- Accept some entities may be cleaned up immediately
- Accept child entity skips

⚠️ Suitable only when historical data loss is acceptable

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/history
