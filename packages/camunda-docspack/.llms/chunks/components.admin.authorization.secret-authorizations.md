# Authorizations — Secret authorizations

Use authorizations on the `SECRET` resource to control which owners can see that a secret reference exists, and which owners can resolve it to its actual value. For background on the `camunda.secrets.<name>` reference syntax, see [secret resolution](https://docs.camunda.io/docs/next/components/concepts/secret-resolution).

A `SECRET` authorization grants one of two permissions:

- `READ`: Lets the owner see that a secret reference exists, for example in a `POST /v2/secrets/list` response.
- `REVEAL`: Lets the owner resolve a reference to its actual value, for example with `POST /v2/secrets/resolve`.

`REVEAL` is never implied by `READ`, and it is never granted automatically alongside it. Grant `REVEAL` only to trusted owners, since it exposes secret values. See [the REVEAL permission for the Secret](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations#reveal-permission-for-the-secret) for why the two permissions are kept separate.

The **Resource ID** you choose determines the scope of the grant:

- `*` grants the permission for every secret reference in the cluster.
- `camunda.secrets.<name>` scopes the permission to one secret reference, for example `camunda.secrets.demoApiToken`.

### Grant secret access to an owner

To grant an owner access to secrets:

1. Log in to Admin, and select the **Authorizations** tab.
2. Click **Create authorization**.
3. Set the **Owner type** to the entity you want to grant access to, such as `Client`, `User`, `Group`, `Role`, or `Mapping rule`.
4. In the **Owner ID** field, enter the owner's ID. For a client, use its **Client ID**.
5. Set the **Resource type** to `SECRET`.
6. In the **Resource ID** field, enter `*` for every secret, or `camunda.secrets.<name>` for one secret.
7. Select **READ** to let the owner see the reference exists, **REVEAL** to let the owner resolve it to its value, or both.
8. Click **Create authorization**.

An owner that resolves a reference without `REVEAL` receives an `ACCESS_DENIED` error instead of the secret value. See [Secrets](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-secrets#review-per-reference-errors) for the full list of resolve and list errors.

### Secret authorization examples

#### Full secret access for a client

To let a client list and resolve every secret in the cluster:

- Owner type: `Client`
- Resource type: `SECRET`
- Resource ID: `*`
- Permissions: `READ`, `REVEAL`

Grant this only to trusted clients, since it exposes every secret value in the cluster.

#### Access to one secret

To scope a client to a single secret reference:

- Owner type: `Client`
- Resource type: `SECRET`
- Resource ID: `camunda.secrets.demoApiToken`
- Permissions: `READ`, `REVEAL`

Create one authorization per secret reference the client needs. Resource IDs don't support partial wildcard matching, so `camunda.secrets.demo*` isn't valid.

---
Source: https://docs.camunda.io/docs/next/components/admin/authorization
