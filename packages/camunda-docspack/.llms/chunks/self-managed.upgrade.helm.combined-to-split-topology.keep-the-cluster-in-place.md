# Move from a combined release to the split topology — Keep the cluster in place

Keep the existing release and namespace as the orchestration release, and then install a new Hub release that takes over the existing Management Identity and Camunda Hub databases. Broker storage and cluster identity never move, so there's no process-state cutover.

**Warning: Run only one Management Identity per database**
Camunda doesn't support running more than one Management Identity against the same database. That's why this procedure converts the combined release first, which removes its Management Identity, and only then installs the Hub release against the same database. Never have the combined release's Management Identity and the Hub release's Management Identity running at the same time.

Plan a maintenance window. From step 2 until the Hub release is ready in step 3, Camunda Hub and Management Identity aren't running. During that window:

- **The Orchestration Cluster keeps running.** Brokers keep processing, the REST and gRPC APIs keep authenticating, and Operate and Tasklist sign-in keeps working. The Orchestration Cluster validates tokens against your OIDC provider and reads authorizations from its own secondary storage, so it doesn't call Management Identity. Pods that restart during the window start normally.
- **Connectors keep running.** Connectors get their tokens from your OIDC provider, not from Management Identity.
- **Optimize is degraded.** Its pods stay ready and restart normally, but Optimize reads tenant assignments and user details from Management Identity, so user lookups fail, and report and dashboard queries fail for multi-tenancy users whose tenants aren't cached. With Keycloak, Optimize reads the user's Optimize permission from the token. With any other OIDC provider, it checks the permission in Management Identity, so browser sessions can be refused during the window. Treat Optimize as unavailable for the window.
- **Your OIDC provider must stay up.** Every component authenticates against it. If Keycloak runs alongside Management Identity, make sure it isn't part of the outage.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
