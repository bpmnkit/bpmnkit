# Cluster inspection and process management — Identity management

Manage users, roles, groups, tenants, authorizations, and mapping rules.

### Users

```bash
c8 list users
c8 search users --name=John --email='john@example.com'
c8 get user john
c8 create user --username=john --name='John Doe' --email=john@example.com --password=secret
c8 delete user john
```

### Roles

```bash
c8 list roles
c8 search roles --name=admin
c8 get role my-role
c8 create role --name=my-role
c8 delete role my-role
```

### Groups

```bash
c8 list groups
c8 search groups --name=developers
c8 get group developers
c8 create group --groupId=developers --name=Developers
c8 delete group developers
```

### Tenants

```bash
c8 list tenants
c8 search tenants --name=Production
c8 get tenant prod
c8 create tenant --tenantId=prod --name='Production'
c8 delete tenant prod
```

### Authorizations

```bash
c8 list auth
c8 search auth --ownerId=john --resourceType=process-definition
c8 get auth 123456
c8 create auth --ownerId=john --ownerType=USER --resourceType=process-definition --resourceId='*' --permissions=READ,CREATE
c8 delete auth 123456
```

### Mapping rules

```bash
c8 list mapping-rules
c8 search mapping-rules --claimName=department
c8 get mapping-rule my-rule
c8 create mapping-rule --mappingRuleId=my-rule --name=my-rule --claimName=department --claimValue=engineering
c8 delete mapping-rule my-rule
```

### Assign and unassign

Use `assign` and `unassign` to manage membership between identity resources:

```bash
# Assign a role to a user
c8 assign role admin --to-user=john

# Assign a user to a group
c8 assign user john --to-group=developers

# Assign a group to a tenant
c8 assign group developers --to-tenant=prod

# Unassign a role from a user
c8 unassign role admin --from-user=john
```

Supported assignment targets:

| Resource       | `assign` targets                                              | `unassign` sources                                                    |
| :------------- | :------------------------------------------------------------ | :-------------------------------------------------------------------- |
| `role`         | `--to-user`, `--to-group`, `--to-tenant`, `--to-mapping-rule` | `--from-user`, `--from-group`, `--from-tenant`, `--from-mapping-rule` |
| `user`         | `--to-group`, `--to-tenant`                                   | `--from-group`, `--from-tenant`                                       |
| `group`        | `--to-tenant`                                                 | `--from-tenant`                                                       |
| `mapping-rule` | `--to-group`, `--to-tenant`                                   | `--from-group`, `--from-tenant`                                       |

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
