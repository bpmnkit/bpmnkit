# Set up two isolated Physical Tenants — Web app walkthrough

| Web app  | `riskprod` URL                                            |
| :------- | :-------------------------------------------------------- |
| Operate  | `https://your-cluster/physical-tenants/riskprod/operate`  |
| Tasklist | `https://your-cluster/physical-tenants/riskprod/tasklist` |

To try a user task end to end in the new tenant:

1. Deploy a process containing a user task to `riskprod`, and start an instance.
2. Open Tasklist at `riskprod`'s URL, claim the task, complete it.
3. Open Tasklist at `default`'s URL. Confirm the task is not visible there.

There's no tenant switcher inside either web app. Switching tenants means navigating to the other tenant's URL, which loads a fully separate session. See [webapp routing](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing#webapp-routing).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started
