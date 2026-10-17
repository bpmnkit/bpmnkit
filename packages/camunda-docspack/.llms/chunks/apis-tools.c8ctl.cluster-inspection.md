# Cluster inspection and process management

Use c8ctl to list, search, and manage process instances, user tasks, incidents, jobs, messages, and forms in a Camunda 8 cluster.

<!-- This page is maintained in the c8ctl repository (https://github.com/camunda/c8ctl, in docs/) and
     is synced to camunda-docs automatically. Do not edit it in camunda-docs — changes will be
     overwritten. Edit the source in the c8ctl repo instead. -->

`c8ctl` follows a `<verb> <resource>` command structure. Most resources have short aliases to reduce typing:

| Resource                | Alias         |
| :---------------------- | :------------ |
| `process-instance(s)`   | `pi`          |
| `process-definition(s)` | `pd`          |
| `user-task(s)`          | `ut`          |
| `incident(s)`           | `inc`         |
| `message`               | `msg`         |
| `variable(s)`           | `vars`, `var` |
| `authorization(s)`      | `auth`        |
| `mapping-rule(s)`       | `mr`          |

Available verbs: `list`, `search`, `get`, `create`, `await`, `delete`, `set`, `cancel`, `complete`, `fail`, `activate`, `update`, `resolve`, `publish`, `correlate`, `assign`, `unassign`.

**Tip**
All commands respect the active profile and tenant. Pass `--profile` to override the profile for a single command:

```bash
c8 list pi --profile=prod
c8 search ut --assignee=jane --profile=staging
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/cluster-inspection
