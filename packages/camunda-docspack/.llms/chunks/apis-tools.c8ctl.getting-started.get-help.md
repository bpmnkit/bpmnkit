# c8ctl CLI — Get help

```bash
c8ctl help                # general help
c8ctl help list           # help for the list command
c8ctl help deploy         # help for the deploy command
c8ctl help profiles       # help for profile management
c8ctl --version           # print version
```

Run any verb without a resource to see what resources are available:

```bash
c8 list                   # shows: pi, pd, ut, inc, jobs, profiles, plugins, users, roles, groups, tenants, auth, mr
c8 search                 # shows: pi, pd, ut, inc, jobs, variables, users, roles, groups, tenants, auth, mr
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/getting-started
