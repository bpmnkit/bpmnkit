# Debugging the authentication flow — Requests fail when an identity provider is unreachable

The Orchestration Cluster contacts an OIDC provider at the first request that needs it, and not at startup. The cluster starts and serves traffic while a provider is unreachable. Only the requests that need that provider fail.

While a provider is unreachable:

- A request that needs a provider the cluster did not resolve yet fails with a server error, and not with an authentication error. This can include a browser login and an API request with a token from that provider.
- A session that the cluster authenticated before the outage keeps its access token until the token expires. The refresh that follows fails, the cluster ends the session, and the request gets an authentication error.
- All other requests succeed.
- Each new request tries again. The cluster serves the failed traffic again when the provider answers. You do not need to restart the cluster.
- The cluster holds no queue of failed requests, and it makes no attempt in the background. One request makes one attempt, so the load on the provider is the rate of the requests that need it. The cluster keeps the first result that it gets, so the attempts stop when the provider answers.
- A failed request writes a warning that names the step that failed — a client registration, the access-token decoder, or a UserInfo endpoint lookup — and the provider with its issuer. The cluster writes at most one warning each minute for each combination of step and provider. A minute without a failed request writes nothing.

An unreachable provider no longer stops the cluster from starting. For a provider that the cluster resolves through its issuer URI, this warning is your only signal that part of the authentication traffic fails. Monitor your log pipeline for `WARN` entries of the logger `io.camunda.security.spring.oidc.DeferredOidcResolution`. Each entry starts with `Failed to resolve`.

The warning follows the traffic, and it is not a health check of the provider. A cluster that gets no request for an unreachable provider writes no warning. Use a synthetic login or a synthetic API request if you must detect such an outage before a user does.

The warning gives the step that failed and the provider with its issuer. It does not give the endpoint that did not answer. Read the exception that the warning attaches to find that endpoint. For a provider that is configured with an issuer URI, this is the discovery endpoint `<issuer-uri>/.well-known/openid-configuration`. Then make sure that the cluster can reach that endpoint. See [test the IdP directly](#test-the-idp-directly).

A provider that sets `jwk-set-uri` or `user-info-uri` needs no discovery. A failure of these endpoints therefore gives a different signal:

- An unreachable `jwk-set-uri` fails the token validation, and it writes no warning or error of its own. Set `LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=DEBUG` to see the cause. No log entry tells you about this failure at the default level, so use a synthetic API request with a valid token to detect it.
- An unreachable `user-info-uri` writes an `ERROR` entry of the logger `io.camunda.security.spring.oidc.CachingOidcClaimsProvider` that gives the issuer and the endpoint. The request then succeeds with the claims of the token only, so the user can lose the groups, roles, or tenants that the UserInfo response adds.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/admin/debugging-authentication
