# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Move per-component truststores to `global.tls.caBundle`

Chart 15.x deprecates per-component JKS truststores. They still work. The chart emits a deprecation warning when you set one of these keys:

- `orchestration.data.secondaryStorage.elasticsearch.tls.secret.*`
- `orchestration.data.secondaryStorage.opensearch.tls.secret.*`
- `optimize.database.elasticsearch.tls.secret.*`
- `optimize.database.opensearch.tls.secret.*`

Supply a PEM-encoded CA bundle through `global.tls.caBundle.secret.existingSecret` and `global.tls.caBundle.secret.existingSecretKey` instead. The chart builds the JVM truststore when the pod starts. When you switch, remove the per-component `tls.secret` entries and any `-Djavax.net.ssl.trustStore*` flags from `javaOpts`. If you set a per-component truststore, it overrides `global.tls.caBundle` for that component. See [configure TLS with a CA bundle](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls).

If you keep a per-component truststore for now, set both `existingSecret` and `existingSecretKey`. For `orchestration.data.secondaryStorage.*.tls.secret`, `existingSecretKey` has no default. Without it, the chart mounts no truststore.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
