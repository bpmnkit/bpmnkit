# Upgrade Camunda 8.9 to 8.10 using Helm — Troubleshooting — Render fails because the Optimize client secret has no key

If `helm upgrade` fails with `[camunda][error] Optimize with OIDC authentication requires an existingSecretKey alongside its existingSecret`, the Optimize client secret references a Kubernetes Secret but doesn't name the key inside the Secret. Without the key, the chart would drop the client secret from the Optimize Deployment.

Set the key next to the Secret name. If you reference the Secret in `global.identity.auth.optimize.secret.existingSecret`, set `global.identity.auth.optimize.secret.existingSecretKey`. If you reference the Secret in `optimize.security.authentication.oidc.secret.existingSecret`, set `optimize.security.authentication.oidc.secret.existingSecretKey`. Alternatively, supply `VALUES_OPTIMIZE_CLIENT_SECRET` yourself through `optimize.env`. Another option is to list `VALUES_OPTIMIZE_CLIENT_SECRET` in `optimize.security.authentication.oidc.envFromProvides`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
