# Identity management

Use c8ctl to manage users, roles, groups, tenants, authorizations, and mapping rules in a Camunda 8 cluster.

<!-- This page is maintained in the c8ctl repository (https://github.com/camunda/c8ctl, in docs/) and
     is synced to camunda-docs automatically. Do not edit it in camunda-docs — changes will be
     overwritten. Edit the source in the c8ctl repo instead. -->

`c8ctl` provides commands to manage identity resources through the Orchestration Cluster API. You can list, search, get, create, and delete users, roles, groups, tenants, authorizations, and mapping rules. Membership management is handled with the `assign` and `unassign` verbs.

| Resource           | Alias  | Available verbs                             |
| :----------------- | :----- | :------------------------------------------ |
| `user(s)`          | —      | `list`, `search`, `get`, `create`, `delete` |
| `role(s)`          | —      | `list`, `search`, `get`, `create`, `delete` |
| `group(s)`         | —      | `list`, `search`, `get`, `create`, `delete` |
| `tenant(s)`        | —      | `list`, `search`, `get`, `create`, `delete` |
| `authorization(s)` | `auth` | `list`, `search`, `get`, `create`, `delete` |
| `mapping-rule(s)`  | `mr`   | `list`, `search`, `get`, `create`, `delete` |

**Tip**
All commands respect the active profile and tenant. Pass `--profile` to override the profile for a single command:

```bash
c8 list users --profile=prod
c8 search roles --profile=staging
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/identity-management
