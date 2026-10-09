# Optimize authentication in Self-Managed — Authenticate API requests

The Optimize API accepts OIDC bearer tokens. For the client steps, see [Optimize API authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication).

Camunda 8.10 no longer accepts the static token `api.accessToken` on this API. The token works only if you opt into the [8.9 component-specific configuration fallback](#fall-back-to-the-89-component-specific-configuration), which Camunda plans to remove in a future release. Migrate the affected API clients to OIDC bearer tokens during 8.10.


## Component-specific configuration keys are deprecated

The Optimize login and API security keys used through 8.9 are deprecated in favor of `camunda.security.*`. Optimize maps recognized component-specific keys automatically and logs a deprecation warning naming the replacement.

Keep `CAMUNDA_OPTIMIZE_IDENTITY_BASE_URL` set. It is not deprecated, and Optimize still uses it to look up users, for example when adding users to a collection.

If you're deploying Camunda 8.10 for the first time, none of this applies to you: configure the `camunda.security.*` properties above and skip this section and the next one.

See [Upgrade Camunda components from 8.9 to 8.10](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#component-specific-security-configuration-keys-are-deprecated) for the full key mapping, precedence rules, and the keys that no longer have any effect.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-optimize
