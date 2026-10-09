# Set up two isolated Physical Tenants — Run and verify

1. Start a process instance scoped to `riskprod` (see [API walkthrough](#api-walkthrough)).
2. Open `https://your-cluster/physical-tenants/riskprod/operate` and confirm the instance is visible.
3. In a second browser tab, open `https://your-cluster/physical-tenants/default/operate`. Confirm the `riskprod` instance does **not** appear, and that `default`'s own instances are unaffected. Each tenant has its own path-scoped session, so you can be logged into both at once without one logout affecting the other. See [session behavior](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/api-routing#session-behavior).
4. Try opening `riskprod`'s Operate with a user who only has a role in `default`. Expect a `403`, not a redirect to `default`'s data, confirming the two tenants don't fall back to each other on authorization failure.

This confirms the isolation the rest of the guide assumes: two tenants, one cluster, no visibility across the boundary.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/getting-started
