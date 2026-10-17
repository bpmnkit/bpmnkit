# Identity management — Authorizations

### List authorizations

```bash
c8 list auth
c8 list authorizations
```

### Search authorizations

```bash
c8 search auth --ownerId=john --resourceType=process-definition
```

### Create an authorization

```bash
c8 create auth --ownerId=john --ownerType=USER --resourceType=process-definition --resourceId='*' --permissions=READ,CREATE
```

### Delete an authorization

```bash
c8 delete auth 2251799813685260
```


## Mapping rules

### List mapping rules

```bash
c8 list mr
c8 list mapping-rules
```

### Search mapping rules

```bash
c8 search mr --name=my-rule
```

### Create a mapping rule

```bash
c8 create mr --mappingRuleId=my-rule --name='My Rule' --claimName=email --claimValue=user@example.com
```

### Delete a mapping rule

```bash
c8 delete mr my-rule
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/identity-management
