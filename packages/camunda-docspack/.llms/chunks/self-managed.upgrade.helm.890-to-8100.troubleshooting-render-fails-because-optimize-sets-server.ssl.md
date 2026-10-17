# Upgrade Camunda 8.9 to 8.10 using Helm — Troubleshooting — Render fails because Optimize sets `server.ssl`

If `helm upgrade` fails with `[camunda][error] optimize.env sets [...], which the Optimize server does not support.` or `[camunda][error] optimize.configuration or optimize.extraConfiguration declares server.ssl, which the Optimize server does not support.`, your values file sets `SERVER_SSL_*` environment variables or `server.ssl.*` properties for Optimize. The chart rejects them regardless of their value.

Optimize installs its own HTTPS connector from `container.keystore.*`. `server.ssl.*` adds a second SSL host configuration named `_default_` to the same connector. As a result, Tomcat aborts at startup.

Remove the `SERVER_SSL_*` environment variables and the `server.ssl.*` properties. To serve TLS from Optimize, set `global.tls.optimize.enabled: true`. Set `global.tls.optimize.cert.secret.existingSecret` to a Secret that holds a PKCS12 keystore (`keystore.p12`) and its password (`keystore-password`). Optimize doesn't support PEM certificates or a key alias.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
