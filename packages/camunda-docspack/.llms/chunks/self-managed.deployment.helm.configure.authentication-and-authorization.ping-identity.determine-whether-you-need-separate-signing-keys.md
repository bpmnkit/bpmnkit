# Connect Camunda to Ping Identity (PingFederate or PingOne) — Determine whether you need separate signing keys

PingFederate deployments commonly sign access tokens with a different key than ID tokens. This is a standard enterprise PingFederate pattern rather than an edge case, so confirm which case applies to your deployment before you deploy Camunda.

### pingfederate

Go to **Authorization Server > Token Settings** and compare the signing certificate under **JWT Access Token** against the one under **OpenID Connect Policy Management**. If they match, your deployment uses a single key and you can skip the dual-key configuration. If they differ, or if you're unsure, assume dual keys.

To find the access token JWKS endpoint, go to **Security > Certificate & Key Management > Runtime Keys**. The key set is published at `https://<pingfederate-host>/pf/JWKS`. Compare this against the `jwks_uri` in your discovery document. If the URLs differ, you have two distinct key sets.

### pingone

Go to **Connections > Applications > your app > Configuration > Token Management**. If a custom access token signing key is configured separately from the OIDC settings, note its JWKS URL. This is your access token JWKS endpoint, distinct from the ID token JWKS in the discovery document.

If your two JWKS URLs differ, follow [Handle separate access token and ID token signing keys](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/generic-oidc-provider#handle-separate-access-token-and-id-token-signing-keys) using the access token JWKS URL you found above.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/ping-identity
