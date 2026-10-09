# Connect Admin to an identity provider — Machine-to-machine (M2M) API access — env

```
CAMUNDA_SECURITY_AUTHENTICATION_OIDC_CLIENTIDCLAIM=<YOUR_CLIENTIDCLAIM>
```

As an example, assume that your client's access token payload looks like this:

```json
{
  "sub": "client123",
  "client-identifier": "123"
}
```

If you have set `camunda.security.authentication.oidc.client-id-claim` to `client-identifier`, then the Orchestration Cluster will use `123` as your client's ID when it applies memberships in groups, roles, and tenants, as well as authorizations.

#### How principal identification works

When both `camunda.security.authentication.oidc.username-claim` and `camunda.security.authentication.oidc.client-id-claim` are configured, and a token containing both claims is presented to the platform, the Orchestration Cluster uses the following logic to identify a single principal for the request:

1. If the client id claim is present, the request is treated as a client request with the corresponding ID.
1. If the client id is not present, the request is treated as a user request with the corresponding username matching the username-claim.
1. If neither the client id claim nor the username claim are set, then the request is rejected.

#### Controlling the principal identification order

In most cases we expect the default detection logic to be sufficient, however if you have a use-case for changing the order, the configuration property `camunda.security.authentication.oidc.prefer-username-claim` can be set to `true`. In this case the logic will be:

1. If the username claim is present, the request is treated as a user request with the corresponding username.
1. If the username claim is not present, the request is treated as a client request with the corresponding ID matching the client id claim.
1. If neither the client id claim nor the username claim are set, then the request is rejected.

#### Recommendations for client ID and username claim configuration

We recommend to set client id claim and username claim as follows:

- The client id claim should not be the same as the username claim.
- The claim that is checked first (based on the ordering defined in [How principal identification works](#how-principal-identification-works) and [Controlling the principal identification order](#controlling-the-principal-identification-order)) should not be present in tokens for the opposite principal type. As an example, using the default logic in [How principal identification works](#how-principal-identification-works), if the client ID claim is `client_id`, then tokens issued for users should not contain a `client_id` claim.
- For ease of use, the client id claim's value should be the client id from the Identity Provider. This way, you can use the same value across both your Identity Provider and the Orchestration Cluster as the identifier of your client.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/connect-external-identity-provider
