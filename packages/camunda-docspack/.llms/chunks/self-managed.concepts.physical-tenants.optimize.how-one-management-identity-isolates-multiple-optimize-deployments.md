# Optimize and Physical Tenants — How one Management Identity isolates multiple Optimize deployments

You do not need a separate Management Identity per Physical Tenant's Optimize instance. A single Management Identity instance can serve every Optimize deployment, provided each one is configured with its own `audience` and its own `roleName`, as shown above.

Isolation between Optimize instances is enforced by the role grant, not by the audience alone:

- Every Optimize instance also accepts a cluster-wide shared audience (the Hub or Web Modeler client audience), so a user's Hub session token can authenticate against any Optimize instance in the deployment. This is intentional. It lets Hub's business value dashboard call Optimize's API on the user's behalf. Authentication alone does not grant access to Optimize data.
- Management Identity stores permissions per audience. When an Optimize instance checks whether the current user may access it, it asks Management Identity for the permissions granted against its own configured audience, not the audience the token happened to authenticate with.
- A user only sees data from an Optimize instance if they hold a role that grants `write:*` on that instance's specific audience. Holding the shared Hub audience in a token is not sufficient on its own.

**Warning**
Set a distinct `roleName` on every Optimize entry (cluster-level and per Physical Tenant) if you want isolated access between them. Every declared Optimize instance contributes its audience to the canonical `Optimize` role by default, and assigning that role grants access to every one of those instances at once. Set `components.optimize.roleName` to a unique value per instance when users must be authorized per Physical Tenant.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/optimize
