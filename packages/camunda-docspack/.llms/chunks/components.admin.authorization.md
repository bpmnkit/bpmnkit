# Authorizations

Learn how to manage authorizations to an Orchestration Cluster.

Use authorizations to control access to resources in your Orchestration Cluster.


## About authorizations

An authorization grants an owner access to a resource and defines the specific permissions they have.

- Owner: The entity that receives permissions, such as a [user](https://docs.camunda.io/docs/next/components/admin/user), [group](https://docs.camunda.io/docs/next/components/admin/group), [role](https://docs.camunda.io/docs/next/components/admin/role), [client](https://docs.camunda.io/docs/next/components/admin/client), or [mapping rule](https://docs.camunda.io/docs/next/components/admin/mapping-rules).
  - In SaaS deployments, the username is the user's email address.
  - In Self-Managed deployments, the username must match [the value of the claim configured as `username-claim`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider#step-4-configure-the-oidc-connection-details).
- Resource: The object that the permissions apply to, such as a process definition, decision definition, or system. See the full list of [available resources](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations#available-resources).

Each authorization specifies which permissions the owner has for the resource (for example, `READ`, `UPDATE`, `DELETE`).

For an authorization to apply, [enable it in your cluster configuration](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations#configuration).

To learn more, see [Orchestration Cluster authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations).

---
Source: https://docs.camunda.io/docs/next/components/admin/authorization
