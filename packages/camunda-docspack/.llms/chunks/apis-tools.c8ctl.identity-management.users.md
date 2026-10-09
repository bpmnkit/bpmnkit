# Identity management — Users

### List users

```bash
c8 list users
```

### Search users

```bash
c8 search users --name=John
c8 search users --email='john@example.com'
c8 search users --name=John --email='john@example.com'
```

### Get a user

```bash
c8 get user john
```

### Create a user

```bash
c8 create user --username=john --name='John Doe' --email=john@example.com --password=changeme
```

### Delete a user

```bash
c8 delete user john
```


## Roles

### List roles

```bash
c8 list roles
```

### Search roles

```bash
c8 search roles --name=admin
```

### Get a role

```bash
c8 get role admin
```

### Create a role

```bash
c8 create role --roleId=my-role --name='My role'
```

### Delete a role

```bash
c8 delete role my-role
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/identity-management
