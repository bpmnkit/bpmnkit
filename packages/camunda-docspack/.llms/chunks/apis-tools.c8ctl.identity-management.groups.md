# Identity management — Groups

### List groups

```bash
c8 list groups
```

### Search groups

```bash
c8 search groups --name=developers
```

### Get a group

```bash
c8 get group developers
```

### Create a group

```bash
c8 create group --groupId=developers --name=Developers
```

### Delete a group

```bash
c8 delete group developers
```


## Tenants

### List tenants

```bash
c8 list tenants
```

### Search tenants

```bash
c8 search tenants --name=Production
```

### Get a tenant

```bash
c8 get tenant prod
```

### Create a tenant

```bash
c8 create tenant --tenantId=prod --name='Production'
```

### Delete a tenant

```bash
c8 delete tenant prod
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/identity-management
