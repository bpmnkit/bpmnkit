# Connect Camunda to Ping Identity (PingFederate or PingOne) — Configure Camunda components

Follow [Configure Camunda components](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider#configure-camunda-components) using the endpoint URLs from your discovery document. A few Ping-specific notes:

- Set `global.identity.auth.type` to `"GENERIC"`.
- Ping's `client_id` claim in access tokens identifies the calling client for both PingFederate and PingOne. The `clientIdClaim` default already matches this, so you typically don't need to override it. Confirm by decoding a real client-credentials token, as described in the [JWT token claims reference](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/jwt-token-claims).
- `sub` is a stable, unique per-user identifier and a safe default for `initialClaimName`. Decode a test token first to confirm which user-identifying claims your Ping deployment populates, as described in [Identify token claims](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider#identify-token-claims).

### Audience configuration requires Ping-side setup

Unlike some providers, Ping doesn't automatically populate the `aud` claim with the requesting client's ID. Set this up in Ping before the `audience` values in your Helm configuration can validate correctly.

### pingfederate

In PingFederate, the `aud` claim comes from an Access Token Manager's **Audience Claim Value** field. This field holds a single static string and doesn't template from the requesting client, so `${client_id}` is taken literally rather than resolved. A shared Access Token Manager therefore can't produce a different `aud` per client.

To give each of the six Camunda components an audience matching its own client ID, create one Access Token Manager per component, each with **Audience Claim Value** hardcoded to that component's client ID, then point each OAuth client's default Access Token Manager at its own. Without this, tokens either carry no `aud` claim or carry the wrong one from a shared Access Token Manager, and Camunda's audience check fails in both cases.

### pingone

Confirm your PingOne resource/scope configuration issues an `aud` claim matching each component's client ID, and adjust the `audience` values in your Helm config to match what you find in a decoded token.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/ping-identity
