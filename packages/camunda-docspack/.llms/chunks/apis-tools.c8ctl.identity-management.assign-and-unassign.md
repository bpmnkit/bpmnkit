# Identity management — Assign and unassign

The `assign` and `unassign` verbs manage membership between identity resources. You can assign users to roles, groups, or tenants, and assign groups to tenants.

### Assign a user to a role

```bash
c8 assign role admin --to-user=john
```

### Unassign a user from a role

```bash
c8 unassign role admin --from-user=john
```

### Assign a user to a group

```bash
c8 assign user john --to-group=developers
```

### Unassign a user from a group

```bash
c8 unassign user john --from-group=developers
```

### Assign a group to a tenant

```bash
c8 assign group developers --to-tenant=prod
```

### Unassign a group from a tenant

```bash
c8 unassign group developers --from-tenant=prod
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/identity-management
